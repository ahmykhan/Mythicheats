import * as XLSX from 'xlsx';

export interface ParsedSlot {
  day: string;
  time: string;
  room: string;
  course: string;
  section: string;
  instructor?: string;
}

const TIME_BLOCKS = [
  '08:30', '10:00', '11:30', '13:00',
  '14:30', '16:00', '17:30', '19:00', '20:30',
];

export const parseFastTimetableRows = (rows: any[][]): ParsedSlot[] => {
  const slots: ParsedSlot[] = [];
  let isDataSection = false;
  let currentDay = '';

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const colA = String(row[0] ?? '').trim();
    const colB = String(row[1] ?? '').trim();

    if (!isDataSection) {
      if (colA.toLowerCase() === 'days' && colB.toLowerCase().startsWith('room')) {
        isDataSection = true;
      }
      continue;
    }

    if (colA !== '') currentDay = colA;
    const room = colB;
    if (!currentDay || !room) continue;

    for (let c = 2; c < row.length; c++) {
      const cellValue = String(row[c] ?? '').trim();
      if (cellValue === '') continue;

      const parts = cellValue.split(/\n|;/).map((s) => s.trim()).filter(Boolean);
      for (const part of parts) {
        const match = part.match(/^(.*?)\s*\((.*?)\)(?:\s*:\s*(.*))?$/);
        if (!match) continue;

        const course = match[1].trim();
        const section = match[2].trim();
        const instructor = match[3] ? match[3].trim() : 'Unknown';

        const blockIndex = Math.floor((c - 2) / 6);
        const time = TIME_BLOCKS[blockIndex] || 'Unknown Time';

        slots.push({
          day: currentDay,
          time,
          room,
          course,
          section: section.toUpperCase(),
          instructor,
        });
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
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
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
