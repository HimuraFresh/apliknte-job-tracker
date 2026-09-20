// 25 y 25000 significan lo mismo: 25.000 euros al ano. Se guarda siempre en euros.
// ponytail: heuristica simple, suficiente mientras nadie cobre menos de 1000 al ano.
export const toEuros = (v: unknown) => {
  const n = Number(v);
  if (v === null || v === "" || !Number.isFinite(n) || n <= 0) return null;
  return Math.round(n < 1000 ? n * 1000 : n);
};

export const money = (n: number | null, locale: string) =>
  n === null
    ? "?"
    : new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(n);
