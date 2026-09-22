// Los numeros pequenos son miles: 25 y 25000 significan lo mismo, 25.000 €. Desde 200
// se toma tal cual, para becas y sueldos mensuales: 300 son 300 €. Se guarda en euros.
// ponytail: heuristica; falla con sueldos anuales de 200.000 € o mas escritos en miles.
export const toEuros = (v: unknown) => {
  const n = Number(v);
  if (v === null || v === "" || !Number.isFinite(n) || n <= 0) return null;
  return Math.round(n < 200 ? n * 1000 : n);
};

export const money = (n: number | null, locale: string) =>
  n === null
    ? "?"
    : new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(n);
