import React, { useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarDays, Download, Upload, X, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import html2canvas from "html2canvas";

const SECTIONS = ["BAI-2A2", "BCS-4A", "BSE-6B"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface TimetableSlot {
  day: string;
  time: string;
  course: string;
  section: string;
  raw: string;
}

interface DatesheetEntry {
  date: string;
  day: string;
  session: "Morning" | "Evening";
  time: string;
  courseCode: string;
  courseTitle: string;
}

const flattenRow = (r: any[]) =>
  (r || []).map((c) => String(c ?? "").trim()).join(" | ").toLowerCase();

const detectFormat = (rows: any[][]): "timetable" | "datesheet" | "unknown" => {
  const head = rows.slice(0, 6).map(flattenRow).join(" \n ");
  if (head.includes("periods") || head.includes("08:30-10:00") || head.includes("08:30 - 10:00")) {
    return "timetable";
  }
  if (head.includes("09:00 - 12:00") || head.includes("1:00 - 4:00") || head.includes("09:00-12:00")) {
    return "datesheet";
  }
  return "unknown";
};

// FSC_TT timetable parser: find "Days" header row, then map columns -> time periods
const parseTimetable = (rows: any[][]): TimetableSlot[] => {
  const slots: TimetableSlot[] = [];
  let headerIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    const first = String(rows[i]?.[0] ?? "").trim().toLowerCase();
    if (first === "days" || first.startsWith("day")) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return slots;

  const headerRow = rows[headerIdx];
  const periods: { col: number; time: string }[] = [];
  for (let c = 1; c < headerRow.length; c++) {
    const t = String(headerRow[c] ?? "").trim();
    if (t) periods.push({ col: c, time: t });
  }

  const cellRegex = /^(.*?)\s*\(([^)]+)\)\s*$/;

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    const day = String(r[0] ?? "").trim();
    if (!day) continue;
    for (const p of periods) {
      const cell = String(r[p.col] ?? "").trim();
      if (!cell) continue;
      // Cell may contain multiple offerings separated by newlines or "/"
      const parts = cell.split(/\n|;/).map((s) => s.trim()).filter(Boolean);
      for (const part of parts) {
        const m = part.match(cellRegex);
        if (m) {
          slots.push({
            day,
            time: p.time,
            course: m[1].trim(),
            section: m[2].trim(),
            raw: part,
          });
        } else {
          slots.push({ day, time: p.time, course: part, section: "", raw: part });
        }
      }
    }
  }
  return slots;
};

const parseDatesheet = (rows: any[][]): DatesheetEntry[] => {
  const entries: DatesheetEntry[] = [];
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;
    const date = String(r[0] ?? "").trim();
    const day = String(r[1] ?? "").trim();
    if (!date && !day) continue;

    const morningCode = String(r[2] ?? "").trim();
    const morningTitle = String(r[3] ?? "").trim();
    if (morningCode) {
      entries.push({
        date, day, session: "Morning",
        time: "09:00 - 12:00",
        courseCode: morningCode, courseTitle: morningTitle,
      });
    }
    const eveningCode = String(r[4] ?? "").trim();
    const eveningTitle = String(r[5] ?? "").trim();
    if (eveningCode) {
      entries.push({
        date, day, session: "Evening",
        time: "1:00 - 4:00",
        courseCode: eveningCode, courseTitle: eveningTitle,
      });
    }
  }
  return entries;
};

const AcademicHub: React.FC = () => {
  const { toast } = useToast();
  const [view, setView] = useState<"timetable" | "datesheet">("timetable");

  // Timetable
  const [timetableData, setTimetableData] = useState<TimetableSlot[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>(SECTIONS[0]);
  const timetableRef = useRef<HTMLDivElement>(null);

  // Datesheet
  const [datesheetData, setDatesheetData] = useState<DatesheetEntry[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const datesheetRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ingestRows = (rows: any[][], sourceName: string) => {
    const fmt = detectFormat(rows);
    if (fmt === "timetable") {
      const slots = parseTimetable(rows);
      setTimetableData(slots);
      toast({
        title: "Timetable loaded",
        description: `${sourceName}: ${slots.length} class slots parsed.`,
      });
    } else if (fmt === "datesheet") {
      const entries = parseDatesheet(rows);
      setDatesheetData(entries);
      toast({
        title: "Datesheet loaded",
        description: `${sourceName}: ${entries.length} exam entries parsed.`,
      });
    } else {
      toast({
        title: "Unknown format",
        description: "Could not detect Timetable or Datesheet headers in this file.",
        variant: "destructive",
      });
    }
  };

  const handleFile = (file: File) => {
    if (file.name.toLowerCase().endsWith(".csv")) {
      Papa.parse(file, {
        complete: (results) => {
          ingestRows(results.data as any[][], file.name);
        },
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;
      try {
        const wb = XLSX.read(data, { type: "binary" });
        // Iterate every sheet — detect & ingest each
        let matched = false;
        for (const name of wb.SheetNames) {
          const sheet = wb.Sheets[name];
          const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
          const fmt = detectFormat(rows);
          if (fmt !== "unknown") {
            ingestRows(rows, `${file.name} → ${name}`);
            matched = true;
          }
        }
        if (!matched) {
          toast({
            title: "Unknown format",
            description: "No sheet matched Timetable or Datesheet headers.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        toast({ title: "Parse error", description: err.message, variant: "destructive" });
      }
    };
    reader.readAsBinaryString(file);
  };

  // Timetable: filter by selected section, group by day
  const timetableBySection = useMemo(() => {
    const filtered = timetableData.filter(
      (s) => s.section.toUpperCase() === selectedSection.toUpperCase()
    );
    const byDay: Record<string, TimetableSlot[]> = {};
    DAYS.forEach((d) => (byDay[d] = []));
    filtered.forEach((s) => {
      const matched = DAYS.find((d) => d.toLowerCase() === s.day.toLowerCase());
      if (matched) byDay[matched].push(s);
    });
    return byDay;
  }, [timetableData, selectedSection]);

  // Datesheet: unique course codes for autocomplete
  const allCodes = useMemo(() => {
    const set = new Set<string>();
    datesheetData.forEach((e) => set.add(e.courseCode));
    return Array.from(set).sort();
  }, [datesheetData]);


  const codeSuggestions = useMemo(() => {
    if (!codeInput.trim()) return [];
    return allCodes
      .filter(
        (c) =>
          c.toLowerCase().includes(codeInput.toLowerCase()) &&
          !selectedCodes.includes(c)
      )
      .slice(0, 8);
  }, [codeInput, allCodes, selectedCodes]);

  const addCode = (code: string) => {
    if (selectedCodes.length >= 10) {
      toast({ title: "Limit reached", description: "Max 10 courses.", variant: "destructive" });
      return;
    }
    setSelectedCodes([...selectedCodes, code]);
    setCodeInput("");
  };

  const filteredDatesheet = useMemo(() => {
    if (selectedCodes.length === 0) return [];
    return datesheet.filter((e) =>
      selectedCodes.some((c) => c.toLowerCase() === e.courseCode.toLowerCase())
    );
  }, [datesheet, selectedCodes]);

  const downloadPNG = async (ref: React.RefObject<HTMLDivElement>, name: string) => {
    if (!ref.current) return;
    try {
      const canvas = await html2canvas(ref.current, {
        backgroundColor: "#0a0118",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `${name}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab toggle */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl border border-purple-500/30 bg-card/40 backdrop-blur-md">
          <button
            onClick={() => setView("timetable")}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
              view === "timetable"
                ? "bg-purple-600/30 text-foreground shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-4 w-4" /> My Timetable
          </button>
          <button
            onClick={() => setView("datesheet")}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
              view === "datesheet"
                ? "bg-purple-600/30 text-foreground shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" /> Exam Datesheet
          </button>
        </div>
      </div>

      {view === "timetable" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">Select Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-[180px] border-purple-500/30 bg-card/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadPNG(timetableRef, `timetable-${selectedSection}`)}
              className="border-purple-500/40"
            >
              <Download className="h-4 w-4 mr-2" /> Download PNG
            </Button>
          </div>

          <div
            ref={timetableRef}
            className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#1a0b2e]/80 to-[#0a0118]/90 backdrop-blur-xl p-5 shadow-[0_0_40px_rgba(168,85,247,0.15)]"
            style={{ fontFamily: "'Space Mono', ui-monospace, monospace" }}
          >
            <h3 className="text-lg font-bold text-foreground mb-4 tracking-wide">
              {selectedSection} — Weekly Timetable
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-3 min-h-[200px]"
                >
                  <div className="text-xs uppercase tracking-widest text-purple-300 mb-3 text-center border-b border-purple-500/20 pb-2">
                    {day}
                  </div>
                  <div className="space-y-2">
                    {timetableBySection[day].length === 0 ? (
                      <div className="text-xs text-muted-foreground/50 text-center pt-6">—</div>
                    ) : (
                      timetableBySection[day].map((slot, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-purple-600/15 border border-purple-500/30 p-2 text-xs"
                        >
                          <div className="text-purple-200 font-bold">{slot.Time || slot.time}</div>
                          <div className="text-foreground">{slot.Course || slot.course}</div>
                          {(slot.Room || slot.room) && (
                            <div className="text-muted-foreground text-[10px]">
                              {slot.Room || slot.room}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
            {timetableRows.length === 0 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                Upload a CSV/Excel file at the bottom of the page to populate.
              </p>
            )}
          </div>
        </div>
      )}

      {view === "datesheet" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[260px] relative">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-500/30 bg-card/40">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Search course code (e.g. CS2001)…"
                  className="flex-1 bg-transparent outline-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && codeSuggestions[0]) addCode(codeSuggestions[0]);
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {selectedCodes.length}/10
                </span>
              </div>
              {codeSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-purple-500/30 bg-card/95 backdrop-blur-md shadow-xl max-h-60 overflow-y-auto">
                  {codeSuggestions.map((c) => (
                    <button
                      key={c}
                      onClick={() => addCode(c)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-purple-600/20"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadPNG(datesheetRef, "exam-datesheet")}
              className="border-purple-500/40"
            >
              <Download className="h-4 w-4 mr-2" /> Download PNG
            </Button>
          </div>

          {selectedCodes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCodes.map((c) => (
                <Badge key={c} variant="secondary" className="bg-purple-600/20 border border-purple-500/40 text-foreground gap-1">
                  {c}
                  <button onClick={() => setSelectedCodes(selectedCodes.filter((x) => x !== c))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div
            ref={datesheetRef}
            className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#1a0b2e]/80 to-[#0a0118]/90 backdrop-blur-xl p-5 shadow-[0_0_40px_rgba(168,85,247,0.15)]"
            style={{ fontFamily: "'Space Mono', ui-monospace, monospace" }}
          >
            <h3 className="text-lg font-bold text-foreground mb-4 tracking-wide">
              Exam Datesheet
            </h3>
            {selectedCodes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Select course codes above to view exam dates.
              </p>
            ) : filteredDatesheet.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No matching exams found. Upload a datesheet at the bottom of the page.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead>
                    <tr className="text-purple-300 text-xs uppercase tracking-wider">
                      <th className="text-left py-2 px-3 border-b border-purple-500/30">Date</th>
                      <th className="text-left py-2 px-3 border-b border-purple-500/30">Day</th>
                      <th className="text-left py-2 px-3 border-b border-purple-500/30">Session</th>
                      <th className="text-left py-2 px-3 border-b border-purple-500/30">Time</th>
                      <th className="text-left py-2 px-3 border-b border-purple-500/30">Code</th>
                      <th className="text-left py-2 px-3 border-b border-purple-500/30">Course</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDatesheet.map((e, i) => (
                      <tr key={i} className="hover:bg-purple-600/10">
                        <td className="py-2 px-3 border-b border-purple-500/10">{e.date}</td>
                        <td className="py-2 px-3 border-b border-purple-500/10">{e.day}</td>
                        <td className="py-2 px-3 border-b border-purple-500/10">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            e.session === "Morning"
                              ? "bg-amber-500/20 text-amber-200"
                              : "bg-indigo-500/20 text-indigo-200"
                          }`}>
                            {e.session}
                          </span>
                        </td>
                        <td className="py-2 px-3 border-b border-purple-500/10">{e.time}</td>
                        <td className="py-2 px-3 border-b border-purple-500/10 text-purple-200 font-bold">{e.courseCode}</td>
                        <td className="py-2 px-3 border-b border-purple-500/10">{e.courseTitle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload at the bottom — populates BOTH timetable & datesheet */}
      <div className="flex flex-col items-center gap-2 pt-6 border-t border-purple-500/20">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-purple-600 hover:bg-purple-500 text-white"
        >
          <Upload className="h-4 w-4 mr-2" /> Upload CSV / Excel
        </Button>
        <p className="text-xs text-muted-foreground">
          File should contain a Timetable sheet (with Section, Day, Time, Course, Room columns) and an Exam Datesheet sheet in FAST-NUCES format.
        </p>
      </div>
    </div>
  );
};

export default AcademicHub;
