import { norm } from "./group.ts";
import { toEuros } from "./money.ts";
import { SOURCES } from "./dict.ts";

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
  url: ["enlace", "link", "url", "oferta", "posting", "anuncio", "web"],
  role: ["puesto", "cargo", "rol", "role", "position", "posicion", "job", "vacante", "titulo"],
  status: ["estado", "status", "fase", "situacion", "resultado", "respuesta"],
  work_mode: ["modalidad", "work mode", "modo", "presenc", "remot", "tipo de trabajo"],
  source: ["via", "fuente", "source", "portal", "canal", "plataforma", "donde"],
  // El maximo antes que el minimo: "max salary" tambien contiene "salary".
  salary_max: ["salario maximo", "salario max", "sueldo maximo", "max salary", "maximo"],
  salary_min: ["salario", "sueldo", "salary", "remuneracion", "banda"],
  // "Contactado" antes que "Seguimiento", y las dos antes que "Fecha": una columna
  // llamada "Fecha de seguimiento" tiene que caer en la del seguimiento.
  followed_up: ["contactado", "contacte", "contacted", "followed"],
  follow_up_on: ["seguimiento", "follow", "recordatorio", "contactar"],
  applied_on: ["fecha", "date", "aplicacion", "aplique", "applied", "dia", "cuando"],
  cv: ["cv", "curriculum", "resume"],
  notes: ["notas", "nota", "comentario", "observacion", "notes", "comment"],
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

const PARTES = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/;

// aaaa-mm-dd, dd/mm/aaaa y, si la hoja es americana, mm/dd/aaaa. Lo de "americana" no se
// decide por la fila sino por la columna entera (ver abajo): un 03/04 no dice nada, pero
// si en otra fila hay un 03/15 la columna entera esta en mm/dd.
export function readDate(value: string, american = false): string | null {
  const v = value.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(v);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;

  const partes = PARTES.exec(v);
  if (!partes) return null;
  const [, a, b, y] = partes;
  const [d, m] = american ? [b, a] : [a, b];
  if (Number(m) > 12 || Number(d) > 31 || Number(m) < 1 || Number(d) < 1) return null;
  return `${y.length === 2 ? `20${y}` : y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// Una columna es americana si en alguna fila el segundo numero pasa de 12: ahi ya no
// puede ser un mes, asi que el primero era el mes.
const isAmerican = (body: string[][], col: string | undefined) =>
  col !== undefined &&
  body.some((row) => {
    const partes = PARTES.exec((row[Number(col)] ?? "").trim());
    return partes ? Number(partes[1]) <= 12 && Number(partes[2]) > 12 : false;
  });

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
    // (ver el comentario de abajo sobre como se elige la columna)
    
    if (!n) return;
    // Gana la palabra mas larga que encaje, no el orden de la lista: "job_url" es el
    // enlace aunque "job" tambien apunte al puesto, y "Web de la empresa" es la empresa
    // aunque "web" apunte al enlace. En los empates manda el orden de arriba.
    let mejor: { campo: keyof typeof COLUMNS; largo: number } | null = null;
    for (const f of Object.keys(COLUMNS) as (keyof typeof COLUMNS)[]) {
      if (f in columns) continue;
      const largo = Math.max(0, ...COLUMNS[f].filter((w) => n.includes(w)).map((w) => w.length));
      if (largo > (mejor?.largo ?? 0)) mejor = { campo: f, largo };
    }
    if (mejor) columns[mejor.campo] = String(i);
    else ignored.push(name.trim());
  });

  const at = (row: string[], field: keyof typeof COLUMNS) => {
    const i = columns[field];
    return i === undefined ? "" : (row[Number(i)] ?? "").trim();
  };

  const byLabel = new Map(cvs.map((cv) => [norm(cv.label), cv.id]));
  // Si una columna de fechas resulta americana, la hoja entera lo es: no hay hojas con
  // una fecha en cada formato.
  const us = isAmerican(body, columns.applied_on) || isAmerican(body, columns.follow_up_on);

  // "30.000 - 35.000 €" en una sola celda son un minimo y un maximo.
  const cifras = (v: string) =>
    v
      .replace(/[^\d,.\-]/g, " ")
      .split(/\s*-\s*|\s+/)
      .map((n) => toEuros(n.replace(/\.(?=\d{3})/g, "").replace(",", ".")))
      .filter((n): n is number => n !== null);

  const drafts = body
    .map((row): Draft | null => {
      const company = at(row, "company").slice(0, 120);
      const role = at(row, "role").slice(0, 120);
      if (!company || !role) return null;

      const url = at(row, "url");
      const source = at(row, "source");
      const applied = readDate(at(row, "applied_on"), us) ?? hoy;
      const rango = cifras(at(row, "salary_min"));

      return {
        company,
        role,
        status: pick(at(row, "status"), STATUS_WORDS, "aplicado"),
        work_mode: at(row, "work_mode") ? pick(at(row, "work_mode"), MODE_WORDS, "no_especifica") : null,
        // La via solo si es una de las nuestras; si no, se deja vacia y no se pierde nada.
        source: SOURCES.find((s) => norm(s) === norm(source)) ?? null,
        salary_min: rango[0] ?? null,
        salary_max: cifras(at(row, "salary_max"))[0] ?? rango[1] ?? null,
        applied_on: applied,
        follow_up_on: readDate(at(row, "follow_up_on"), us),
        followed_up: YES.includes(norm(at(row, "followed_up"))),
        url: /^https?:\/\//.test(url) ? url.slice(0, 500) : null,
        notes: at(row, "notes").slice(0, 2000) || null,
        cv_version_id: byLabel.get(norm(at(row, "cv"))) ?? null,
      };
    })
    .filter((d): d is Draft => d !== null);

  return { drafts, columns, ignored };
}

