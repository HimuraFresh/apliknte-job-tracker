// Excel en español separa por ";" y sin la marca del principio (BOM) se come las tildes.
// Google Sheets entiende las dos cosas, asi que se elige lo que le duele a Excel.
export const SEP = ";";

const cell = (v: string) =>
  v.includes(SEP) || /["\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

export const toCsv = (rows: string[][]) =>
  "\uFEFF" + rows.map((r) => r.map(cell).join(SEP)).join("\r\n");
