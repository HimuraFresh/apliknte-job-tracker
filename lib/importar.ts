import { norm } from "./group.ts";
import { toEuros } from "./money.ts";
import { STATUSES, WORK_MODES, SOURCES } from "./dict.ts";

// Leer la tabla que trae el usuario: un CSV, un TSV o las celdas copiadas de Excel o de
// Sheets (al pegar, el portapapeles ya viene separado por tabuladores). No se usa ninguna
// libreria: son comillas y separadores, y asi no metemos a nadie mas en medio.

export type Draft = {
  company: string;
  role: string;
  status: string;
  work_mode: string | null;
  source: string | null;
  salary_min: number | null;
  salary_max: number | null;
  applied_on: string;
  follow_up_on: string | null;
  followed_up: boolean;
  url: string | null;
  notes: string | null;
  cv_version_id: string | null;
};

// El separador es el que mas aparece en la primera linea, mirando fuera de las comillas.
function separator(text: string) {
  const line = text.slice(0, text.search(/\r?\n/) + 1 || undefined);
  const count = (sep: string) => line.split(sep).length;
  return [";", "\t", ","].sort((a, b) => count(b) - count(a))[0];
}

// Divide respetando las comillas: un campo entrecomillado puede llevar el separador,
// saltos de linea y comillas dobladas ("" es una comilla de verdad).
export function parse(text: string): string[][] {
  const sep = separator(text.replace(/^\uFEFF/, ""));
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const clean = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === sep) {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  row.push(field);
  rows.push(row);

  // Fuera las filas vacias del final y las lineas en blanco de en medio.
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

// Como puede venir llamada cada columna. Se compara sin tildes ni mayusculas, y basta con
// que el nombre de la columna contenga una de estas palabras.
const COLUMNS: Record<keyof Draft | "cv", string[]> = {
  company: ["empresa", "company", "compania", "organizacion", "employer", "negocio"],
  role: ["puesto", "cargo", "rol", "role", "position", "job", "vacante", "titulo"],
  status: ["estado", "status", "fase", "situacion", "resultado"],
  work_mode: ["modalidad", "work mode", "modo", "presencial", "remoto", "tipo de trabajo"],
  source: ["via", "fuente", "source", "portal", "canal", "plataforma", "donde"],
  salary_min: ["salario minimo", "salario min", "sueldo minimo", "min salary", "salario", "sueldo"],
  salary_max: ["salario maximo", "salario max", "sueldo maximo", "max salary"],
  applied_on: ["fecha", "date", "aplicacion", "applied", "dia", "cuando"],
  follow_up_on: ["seguimiento", "follow", "recordatorio", "contactar"],
  followed_up: ["contactado", "contacte", "followed"],
  url: ["enlace", "link", "url", "oferta", "posting", "anuncio"],
  notes: ["notas", "nota", "comentario", "observacion", "notes", "comment"],
  cv: ["cv", "curriculum", "resume"],
  cv_version_id: [],
};

// "1ª entrevista", "Rechazado", "rejected", "descartada"... todo a los estados de la app.
const STATUS_WORDS: [string, string][] = [
  ["rechaz", "rechazado"],
  ["reject", "rechazado"],
  ["descart", "rechazado"],
  ["retir", "retirado"],
  ["withdraw", "retirado"],
  ["contratad", "contratado"],
  ["hired", "contratado"],
  ["ofert", "oferta"],
  ["offer", "oferta"],
  ["3", "entrevista_3"],
  ["2", "entrevista_2"],
  ["entrevista", "entrevista_1"],
  ["interview", "entrevista_1"],
  ["contact", "cribado"],
  ["criba", "cribado"],
  ["screen", "cribado"],
];

const MODE_WORDS: [string, string][] = [
  ["presencial", "presencial"],
  ["office", "presencial"],
  ["oficina", "presencial"],
  ["hibrid", "hibrido"],
  ["hybrid", "hibrido"],
  ["remot", "remoto"],
  ["teletrab", "remoto"],
];

const pick = (value: string, words: [string, string][], fallback: string) => {
  const v = norm(value.trim());
  if (!v) return fallback;
  return words.find(([word]) => v.includes(word))?.[1] ?? fallback;
};

const YES = ["si", "yes", "true", "x", "1", "hecho", "done"];

// dd/mm/aaaa, dd-mm-aaaa y aaaa-mm-dd. Con dia y mes ambiguos se toma el formato de aqui
// (dd/mm), que es el que escriben Excel y Sheets en español; la vista previa lo ensena
// antes de guardar para que se pueda corregir.
export function readDate(value: string): string | null {
  const v = value.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(v);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;

  const dmy = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/.exec(v);
  if (!dmy) return null;
  const [, d, m, y] = dmy;
  const year = y.length === 2 ? `20${y}` : y;
  if (Number(m) > 12) return null;
  return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export type Mapped = {
  drafts: Draft[];
  columns: Partial<Record<keyof Draft | "cv", string>>;
  ignored: string[];
};

// De la tabla en bruto a candidaturas. Empresa y puesto son lo unico imprescindible: sin
// una de las dos, la fila se queda fuera.
export function mapRows(
  table: string[][],
  cvs: { id: string; label: string }[] = [],
  hoy = new Date().toISOString().slice(0, 10),
): Mapped {
  const [head = [], ...body] = table;
  const columns: Mapped["columns"] = {};
  const ignored: string[] = [];

  head.forEach((name, i) => {
    const n = norm(name.trim());
    // El primero que encaja se queda con la columna: asi "salario maximo" no cae en
    // "salario", que esta antes en la lista de salary_min.
    const field = (Object.keys(COLUMNS) as (keyof typeof COLUMNS)[])
      .filter((f) => !(f in columns))
      .find((f) => COLUMNS[f].some((w) => n.includes(w)));
    if (field && n) columns[field] = String(i);
    else if (n) ignored.push(name.trim());
  });

  const at = (row: string[], field: keyof typeof COLUMNS) => {
    const i = columns[field];
    return i === undefined ? "" : (row[Number(i)] ?? "").trim();
  };

  const byLabel = new Map(cvs.map((cv) => [norm(cv.label), cv.id]));

  const drafts = body
    .map((row): Draft | null => {
      const company = at(row, "company").slice(0, 120);
      const role = at(row, "role").slice(0, 120);
      if (!company || !role) return null;

      const url = at(row, "url");
      const source = at(row, "source");
      const applied = readDate(at(row, "applied_on")) ?? hoy;

      return {
        company,
        role,
        status: pick(at(row, "status"), STATUS_WORDS, "aplicado"),
        work_mode: at(row, "work_mode") ? pick(at(row, "work_mode"), MODE_WORDS, "no_especifica") : null,
        // La via solo si es una de las nuestras; si no, se deja vacia y no se pierde nada.
        source: SOURCES.find((s) => norm(s) === norm(source)) ?? null,
        salary_min: toEuros(at(row, "salary_min").replace(/[^\d,.]/g, "").replace(",", ".")),
        salary_max: toEuros(at(row, "salary_max").replace(/[^\d,.]/g, "").replace(",", ".")),
        applied_on: applied,
        follow_up_on: readDate(at(row, "follow_up_on")),
        followed_up: YES.includes(norm(at(row, "followed_up"))),
        url: /^https?:\/\//.test(url) ? url.slice(0, 500) : null,
        notes: at(row, "notes").slice(0, 2000) || null,
        cv_version_id: byLabel.get(norm(at(row, "cv"))) ?? null,
      };
    })
    .filter((d): d is Draft => d !== null);

  return { drafts, columns, ignored };
}

export const STATUS_OK = (s: string) => STATUSES.includes(s as (typeof STATUSES)[number]);
export const MODE_OK = (m: string) => WORK_MODES.includes(m as (typeof WORK_MODES)[number]);
