// Dias enteros, comparando medianoche con medianoche: si comparamos contra la
// hora actual, "hoy" se convierte en "hace 1 dia" a partir del mediodia.
export const daysUntil = (isoDate: string, from = new Date()) => {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const target = new Date(isoDate + "T00:00:00");
  if (Number.isNaN(target.getTime())) return 0;
  return Math.round((target.getTime() - start.getTime()) / 86400000);
};

export const daysSince = (isoDate: string, from = new Date()) =>
  Math.max(0, -daysUntil(isoDate, from));

export const plusDays = (isoDate: string, days: number) => {
  const d = new Date(isoDate + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const today = () => toISODate(new Date());
