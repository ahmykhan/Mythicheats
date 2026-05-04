import React, { useRef, useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarDays, Download, X, Search, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Papa from "papaparse";
import html2canvas from "html2canvas";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = ["08:30", "10:00", "11:30", "13:00", "14:30", "16:00"];

const TIMETABLE_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQXsoSWXR_QDC53lWTwhok8-msoAJbbX0bcds7P0w5PJyj0TQciOXfCsu26YRcScwYD3RzWBSg78TPI/pub?output=csv";
const DATESHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSTkwx13Jfg9lXSXSNlBr2WYRHO9_kw1jl7ctknj2MYlpxs2qgKBTIFcO8O-kkh0_P6fNvUWSDnv7ls/pub?output=csv";

interface TimetableRow {
  Day: string;
  Room: string;
  StartTime: string;
  Course: string;
  Section: string;
  Teacher: string;
}

interface DatesheetRow {
  Day: string;
  Date: string;
  Time: string;
  CourseCode: string;
  Subject: string;
}

const norm = (v: any) => String(v ?? "").trim();

// Match a day cell against canonical day names (Mon/Tue prefixes work too)
const matchDay = (raw: string): string | null => {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  return DAYS.find((d) => d.toLowerCase().startsWith(v.slice(0, 3))) || null;
};

// Pick a value out of a row by trying multiple header aliases (case-insensitive)
const pick = (row: any, keys: string[]): string => {
  const map: Record<string, string> = {};
  Object.keys(row || {}).forEach((k) => (map[k.trim().toLowerCase()] = k));
  for (const k of keys) {
    const real = map[k.toLowerCase()];
    if (real && norm(row[real])) return norm(row[real]);
  }
  return "";
};

const AcademicHub: React.FC = () => {
  const { toast } = useToast();
  const [view, setView] = useState<"timetable" | "datesheet">("timetable");

  // Timetable
  const [timetableData, setTimetableData] = useState<TimetableRow[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const timetableRef = useRef<HTMLDivElement>(null);

  // Datesheet
  const [datesheetData, setDatesheetData] = useState<DatesheetRow[]>([]);
  const [datesheetLoading, setDatesheetLoading] = useState(true);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const datesheetRef = useRef<HTMLDivElement>(null);

  // Fetch published Google Sheets CSVs on mount
  useEffect(() => {
    (async () => {
      try {
        setTimetableLoading(true);
        const res = await fetch(TIMETABLE_CSV_URL);
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        const rows = (parsed.data as any[])
          .map((r) => ({
            Day: pick(r, ["Day"]),
            Room: pick(r, ["Room"]),
            StartTime: pick(r, ["StartTime", "Start Time", "Time"]),
            Course: pick(r, ["Course", "Course Name", "CourseName"]),
            Section: pick(r, ["Section"]).toUpperCase(),
            Teacher: pick(r, ["Teacher", "Instructor"]),
          }))
          .filter((r) => r.Day && r.Section && r.StartTime);
        setTimetableData(rows);
      } catch (err: any) {
        console.error("Timetable fetch failed:", err);
        toast({ title: "Failed to load timetable", description: err.message, variant: "destructive" });
      } finally {
        setTimetableLoading(false);
      }
    })();

    (async () => {
      try {
        setDatesheetLoading(true);
        const res = await fetch(DATESHEET_CSV_URL);
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        const formattedDatesheet: DatesheetRow[] = [];
        (parsed.data as any[]).forEach((r) => {
          const day = pick(r, ["Day"]);
          const date = pick(r, ["Date"]);
          const morningCode = pick(r, ["MorningCode"]).toUpperCase();
          const morningSubject = pick(r, ["MorningSubject"]);
          const eveningCode = pick(r, ["EveningCode"]).toUpperCase();
          const eveningSubject = pick(r, ["EveningSubject"]);
          if (morningCode) {
            formattedDatesheet.push({
              Day: day,
              Date: date,
              Time: "09:00 - 12:00",
              CourseCode: morningCode,
              Subject: morningSubject,
            });
          }
          if (eveningCode) {
            formattedDatesheet.push({
              Day: day,
              Date: date,
              Time: "1:00 - 4:00",
              CourseCode: eveningCode,
              Subject: eveningSubject,
            });
          }
        });
        setDatesheetData(formattedDatesheet);
      } catch (err: any) {
        console.error("Datesheet fetch failed:", err);
        toast({ title: "Failed to load datesheet", description: err.message, variant: "destructive" });
      } finally {
        setDatesheetLoading(false);
      }
    })();
  }, []);

  // Sections dropdown
  const availableSections = useMemo(() => {
    const set = new Set<string>();
    timetableData.forEach((r) => r.Section && set.add(r.Section));
    return Array.from(set).sort();
  }, [timetableData]);

  useEffect(() => {
    if (availableSections.length && !availableSections.includes(selectedSection)) {
      setSelectedSection(availableSections[0]);
    }
  }, [availableSections, selectedSection]);

  // Filter timetable by selected section, group by day
  const timetableBySection = useMemo(() => {
    const filtered = timetableData.filter((r) => r.Section === selectedSection);
    const byDay: Record<string, TimetableRow[]> = {};
    DAYS.forEach((d) => (byDay[d] = []));
    filtered.forEach((r) => {
      const d = matchDay(r.Day);
      if (d) byDay[d].push(r);
    });
    DAYS.forEach((d) =>
      byDay[d].sort((a, b) => a.StartTime.localeCompare(b.StartTime))
    );
    return byDay;
  }, [timetableData, selectedSection]);

  // Datesheet codes
  const allCodes = useMemo(() => {
    const set = new Set<string>();
    datesheetData.forEach((e) => set.add(e.CourseCode));
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
    return datesheetData.filter((e) =>
      selectedCodes.some((c) => c.toLowerCase() === e.CourseCode.toLowerCase())
    );
  }, [datesheetData, selectedCodes]);

  const downloadPNG = async (ref: React.RefObject<HTMLDivElement>, name: string) => {
    if (!ref.current) return;
    try {
      const canvas = await html2canvas(ref.current, { backgroundColor: "#0a0118", scale: 2 });
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
      {/* Tabs */}
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
            <CalendarDays className="h-4 w-4" /> Class Timetable
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
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
                disabled={availableSections.length === 0}
              >
                <SelectTrigger className="w-[220px] border-purple-500/30 bg-card/40">
                  <SelectValue
                    placeholder={
                      timetableLoading ? "Loading…" : availableSections.length === 0 ? "No sections" : "Select section"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSections.map((s) => (
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
              {selectedSection ? `${selectedSection} — Weekly Timetable` : "Weekly Timetable"}
            </h3>

            {timetableLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading timetable…
              </div>
            ) : (
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
                            <div className="text-purple-200 font-bold">{slot.StartTime}</div>
                            <div className="text-foreground">{slot.Course}</div>
                            {slot.Room && (
                              <div className="text-amber-200/80 text-[10px]">Room {slot.Room}</div>
                            )}
                            {slot.Teacher && (
                              <div className="text-purple-200/70 text-[10px]">{slot.Teacher}</div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                  placeholder={datesheetLoading ? "Loading datesheet…" : "Search course code (e.g. CS2001)…"}
                  className="flex-1 bg-transparent outline-none text-sm"
                  disabled={datesheetLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && codeSuggestions[0]) addCode(codeSuggestions[0]);
                  }}
                />
                <span className="text-xs text-muted-foreground">{selectedCodes.length}/10</span>
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
            <h3 className="text-lg font-bold text-foreground mb-4 tracking-wide">Exam Datesheet</h3>
            {datesheetLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading datesheet…
              </div>
            ) : selectedCodes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Select course codes above to view exam dates.
              </p>
            ) : filteredDatesheet.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No matching exams found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead>
                    <tr className="text-purple-300 text-xs uppercase tracking-wider">
                      <th className="text-left py-2 px-3 border-b border-purple-500/30">Day</th>
                      <th className="text-left py-2 px-3 border-b border-purple-500/30">Date</th>
                      <th className="text-left py-2 px-3 border-b border-purple-500/30">Time</th>
                      <th className="text-left py-2 px-3 border-b border-purple-500/30">Course Code</th>
                      <th className="text-left py-2 px-3 border-b border-purple-500/30">Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDatesheet.map((e, i) => (
                      <tr key={i} className="hover:bg-purple-600/10">
                        <td className="py-2 px-3 border-b border-purple-500/10">{e.Day}</td>
                        <td className="py-2 px-3 border-b border-purple-500/10">{e.Date}</td>
                        <td className="py-2 px-3 border-b border-purple-500/10">{e.Time}</td>
                        <td className="py-2 px-3 border-b border-purple-500/10 text-purple-200 font-bold">{e.CourseCode}</td>
                        <td className="py-2 px-3 border-b border-purple-500/10">{e.Subject}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicHub;
