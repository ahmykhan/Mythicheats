import * as XLSX from 'xlsx';

export interface ParsedSlot {
  day: string;
  time: string;
  startTime: string;
  room: string;
  course: string;
  section: string;
  teacher: string;
  instructor?: string;
}

// Each major time block in the FAST TT spans 6 sub-columns (10/20/30/40/50/60 min markers)
const TIME_BLOCKS = ['08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'];

const DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const isDayCell = (v: string) => DAY_NAMES.includes(v.trim().toLowerCase());

// Stateful parser:
//   - currentDay persists across rooms in the same day
//   - currentRoom persists across multi-line rows
//   - column index → time block via floor((col - 2) / 6)
export const parseFastTimetableRows = (rows: any[][]): ParsedSlot[] => {
  const slots: ParsedSlot[] = [];

  // Find the first row that looks like a "data" row (a Day name in col A or
  // any cell that contains a `(SECTION)` token). We start from row index 5 by
  // default per FAST_TT layout, but fall back to scanning for the first day.
  let startRow = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] || [];
    const a = String(r[0] ?? '').trim();
    if (isDayCell(a)) { startRow = i; break; }
  }

  let currentDay = '';
  let currentRoom = '';

  for (let r = startRow; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const colA = String(row[0] ?? '').trim();
    const colB = String(row[1] ?? '').trim();

    // Stateful: only update when non-empty, otherwise keep previous
    if (colA && isDayCell(colA)) currentDay = colA;
    if (colB) currentRoom = colB;

    if (!currentDay) continue;

    for (let c = 2; c < row.length; c++) {
      const cellValue = String(row[c] ?? '').trim();
      if (!cellValue) continue;

      const blockIndex = Math.floor((c - 2) / 6);
      const time = TIME_BLOCKS[blockIndex] || 'Unknown Time';

      const parts = cellValue.split(/\n|;/).map((s) => s.trim()).filter(Boolean);
      for (const part of parts) {
        // Match: Course (SECTION): Teacher  — colon + teacher optional
        const match = part.match(/^(.*?)\s*\(([^)]+)\)(?:\s*[:\-]\s*(.*))?$/);
        if (!match) continue;

        const course = match[1].trim();
        const sectionRaw = match[2].trim();
        const teacher = (match[3] || '').trim() || 'Unknown';

        // A cell may contain multiple comma-separated sections like "(BCS-2A, BCY-2A)"
        const sectionList = sectionRaw.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
        for (const section of sectionList) {
          slots.push({
            day: currentDay,
            time,
            startTime: time,
            room: currentRoom,
            course,
            section: section.toUpperCase(),
            teacher,
            instructor: teacher,
          });
        }
      }
    }
  }

  return slots;
};

export const parseFastTimetable = async (file: File): Promise<ParsedSlot[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        // Prefer the "Combined TT" sheet; fall back to the first sheet.
        const targetName =
          workbook.SheetNames.find((n) => n.toLowerCase().includes('combined')) ||
          workbook.SheetNames[0];
        const worksheet = workbook.Sheets[targetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        resolve(parseFastTimetableRows(rows));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
