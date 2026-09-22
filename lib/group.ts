// Busqueda sin tildes ni mayusculas: "iberdrola" encuentra "Iberdrola", "tecnico" encuentra "técnico".
export const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// Agrupa por empresa o por puesto sin distinguir mayusculas, tildes ni espacios de
// sobra ("Indra" e "indra " van juntas). Primero los grupos mas grandes; dentro de
// cada grupo se mantiene el orden de llegada.
export function groupBy<T extends Record<K, string>, K extends string>(rows: T[], key: K): T[][] {
  const groups = new Map<string, T[]>();
  for (const r of rows) {
    const k = norm(r[key].trim());
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  return [...groups.values()].sort((a, b) => b.length - a.length);
}
