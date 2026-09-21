"use client";

import { useId, useState, useTransition } from "react";
import { useLang, setLocale } from "@/lib/lang";
import { STATUSES, WORK_MODES, SOURCES, type Dict } from "@/lib/dict";
import { money, toEuros } from "@/lib/money";
import { daysSince, daysUntil, plusDays, today } from "@/lib/dates";
import {
  addApplication,
  updateApplication,
  deleteApplication,
  setFollowedUp,
  setStatus,
} from "@/app/panel/actions";
import { signOut } from "@/app/entrar/actions";
import Logo from "@/components/Logo";
import SuggestionPanel from "@/components/SuggestionPanel";
import { supabaseBrowser } from "@/lib/supabase/client";

export type Application = {
  id: string;
  company: string;
  role: string;
  source: string | null;
  url: string | null;
  work_mode: string | null;
  salary_min: number | null;
  salary_max: number | null;
  applied_on: string;
  status: string;
  follow_up_on: string | null;
  followed_up: boolean;
  cv_version_id: string | null;
};

export type Cv = { id: string; label: string };

const MAX_CV_BYTES = 5 * 1024 * 1024;

// Busqueda sin tildes ni mayusculas: "iberdrola" encuentra "Iberdrola", "tecnico" encuentra "técnico".
const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// Aspecto comun de los botones tipo "globito" que se marcan y desmarcan.
const chip = (on: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm transition ${
    on ? "border-brand bg-brand-soft text-brand" : "border-border text-muted hover:text-foreground"
  }`;

const STATUS_TONE: Record<string, string> = {
  aplicado: "bg-brand-soft text-brand",
  cribado: "bg-brand/20 text-brand",
  entrevista_1: "bg-warn/15 text-warn",
  entrevista_2: "bg-warn/20 text-warn",
  entrevista_3: "bg-warn/30 text-warn",
  oferta: "bg-ok/20 text-ok",
  contratado: "bg-ok text-white",
  rechazado: "bg-bad/15 text-bad",
  retirado: "bg-muted/20 text-muted",
};

const tone = (status: string) => STATUS_TONE[status] ?? "bg-muted/15 text-muted";

const CLOSED = ["contratado", "rechazado", "retirado"];
const INTERVIEWING = ["cribado", "entrevista_1", "entrevista_2", "entrevista_3"];

// Sin fecha guardada damos por supuestos 15 dias desde que aplicaste.
const isDue = (r: Application) =>
  !r.followed_up &&
  !CLOSED.includes(r.status) &&
  daysUntil(r.follow_up_on ?? plusDays(r.applied_on, 15)) <= 0;

// Cada recuadro del resumen cuenta y filtra con la misma regla.
const FILTERS = {
  active: (r: Application) => !CLOSED.includes(r.status),
  waiting: (r: Application) => r.status === "aplicado",
  interviews: (r: Application) => INTERVIEWING.includes(r.status),
  due: isDue,
};
type Filter = keyof typeof FILTERS;

export default function Panel({
  rows,
  cvs,
  userId,
}: {
  rows: Application[];
  cvs: Cv[];
  userId: string;
}) {
  const { t, locale } = useLang();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Filter | null>(null);
  const [warning, setWarning] = useState<string>();
  const [suggestOpen, setSuggestOpen] = useState(false);
  const showForm = open || editing !== null;

  // Los recuadros a 0 no se muestran. Si el filtro elegido se queda a 0, se ven todas.
  const tiles = (
    [
      { key: "active", label: t.summaryActive, tone: "text-foreground" },
      { key: "waiting", label: t.summaryWaiting, tone: "text-brand" },
      { key: "interviews", label: t.summaryInterviews, tone: "text-warn" },
      { key: "due", label: t.summaryDue, tone: "text-warn" },
    ] as const
  )
    .map((tile) => ({ ...tile, n: rows.filter(FILTERS[tile.key]).length }))
    .filter((tile) => tile.n > 0);
  const filter = tiles.find((tile) => tile.key === picked);

  const q = norm(query.trim());
  const visible = rows.filter(
    (r) =>
      (!filter || FILTERS[filter.key](r)) &&
      (!q || norm(`${r.company} ${r.role}`).includes(q)),
  );
  const cvLabels = new Map(cvs.map((cv) => [cv.id, cv.label]));

  const companies = [...new Set(rows.map((r) => r.company))];
  const roles = [...new Set(rows.map((r) => r.role))];


  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-5 sm:p-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl">
            <Logo />
          </h1>
          <p className="text-sm text-muted">
            {rows.length} {rows.length === 1 ? t.totalOne : t.total}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted">
          <button
            onClick={() => setLocale(locale === "es" ? "en" : "es")}
            className="transition hover:text-foreground"
          >
            {locale === "es" ? "EN" : "ES"}
          </button>
          <button
            onClick={() => setSuggestOpen(!suggestOpen)}
            aria-expanded={suggestOpen}
            className="rounded-full bg-brand-soft px-3 py-1 text-brand transition hover:bg-brand/20"
          >
            {t.suggestions}
          </button>
          <form action={signOut}>
            <button className="rounded-full bg-bad/10 px-3 py-1 text-bad transition hover:bg-bad/20">
              {t.signOut}
            </button>
          </form>
        </div>
      </header>

      {suggestOpen && <SuggestionPanel onClose={() => setSuggestOpen(false)} />}

      {tiles.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((tile) => (
            <Tile
              key={tile.key}
              n={tile.n}
              label={tile.label}
              tone={tile.tone}
              on={filter?.key === tile.key}
              onClick={() => setPicked(filter?.key === tile.key ? null : tile.key)}
            />
          ))}
        </div>
      )}

      {/* Movil: titulo y boton arriba, buscador debajo a todo lo ancho. Ordenador: los tres en fila. */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <h2 className="order-1 flex items-center gap-2 text-lg font-medium">
          {t.yourApplications}
          {filter && !showForm && (
            <button
              onClick={() => setPicked(null)}
              aria-label={`${t.clearFilter}: ${filter.label}`}
              className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand transition hover:bg-brand/20"
            >
              {filter.label} ✕
            </button>
          )}
        </h2>
        {!showForm && rows.length > 0 && (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            aria-label={t.search}
            className="order-3 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand sm:order-2 sm:w-auto sm:flex-1"
          />
        )}
        <button
          onClick={() => {
            setEditing(null);
            setOpen(!open);
          }}
          className="order-2 ml-auto shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 sm:order-3 sm:ml-0"
        >
          {showForm ? t.cancel : `+ ${t.newApplication}`}
        </button>
      </div>

      {showForm && (
        <ApplicationForm
          key={editing?.id ?? "new"}
          t={t}
          initial={editing}
          companies={companies}
          roles={roles}
          cvs={cvs}
          userId={userId}
          onDone={(w) => {
            setOpen(false);
            setEditing(null);
            setWarning(w);
          }}
        />
      )}

      {warning && (
        <div className="mt-4 flex max-w-3xl items-start justify-between gap-3 rounded-2xl border border-warn/40 bg-warn/10 p-4 text-sm text-warn">
          <p>{warning}</p>
          <button onClick={() => setWarning(undefined)} aria-label={t.cancel} className="shrink-0">
            ✕
          </button>
        </div>
      )}

      {!showForm && (
        <section className="mt-4 grid max-w-3xl gap-3">
          {rows.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
              {t.empty}
            </p>
          )}

          {q && visible.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
              {t.noResults(query.trim())}
            </p>
          )}

          {visible.map((r) => (
            <Card
              key={r.id}
              r={r}
              t={t}
              locale={locale}
              cvLabel={r.cv_version_id ? cvLabels.get(r.cv_version_id) : undefined}
              onEdit={() => {
                setWarning(undefined);
                setEditing(r);
              }}
            />
          ))}
        </section>
      )}
    </main>
  );
}

function Tile({
  n,
  label,
  tone,
  on,
  onClick,
}: {
  n: number;
  label: string;
  tone: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-2xl border px-4 py-3 text-left transition ${
        on ? "border-brand bg-brand-soft ring-1 ring-brand" : "border-border bg-surface hover:border-brand"
      }`}
    >
      <p className={`text-2xl font-semibold ${tone}`}>{n}</p>
      <p className="text-xs text-muted">{label}</p>
    </button>
  );
}

function Card({
  r,
  t,
  locale,
  cvLabel,
  onEdit,
}: {
  r: Application;
  t: Dict;
  locale: string;
  cvLabel?: string;
  onEdit: () => void;
}) {
  const [pending, start] = useTransition();
  const [picking, setPicking] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const run = (fn: () => Promise<unknown>) => start(() => void fn());

  // Negativo = ya deberias haber contactado.
  const daysToFollowUp = daysUntil(r.follow_up_on ?? plusDays(r.applied_on, 15));
  const overdue = isDue(r);

  return (
    <article
      className={`relative min-w-0 rounded-2xl border bg-surface p-4 transition ${
        overdue ? "border-warn/60" : "border-border hover:border-brand"
      } ${pending ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-medium">{r.role}</h2>
          <p className="truncate text-sm text-muted">{r.company}</p>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setPicking(!picking)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80 ${tone(r.status)}`}
          >
            {t[r.status as keyof Dict] as string}
          </button>

          {picking && (
            <>
              {/* Capta el clic fuera para cerrar el globito */}
              <div className="fixed inset-0 z-10" onClick={() => setPicking(false)} />
              <div className="absolute right-0 z-20 mt-2 w-60 rounded-2xl border border-border bg-surface p-2 shadow-xl">
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setPicking(false);
                        if (st !== r.status) run(() => setStatus(r.id, st));
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition hover:opacity-80 ${tone(st)} ${
                        st === r.status ? "ring-2 ring-brand ring-offset-2 ring-offset-surface" : ""
                      }`}
                    >
                      {t[st as keyof Dict] as string}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span>{t.daysAgo(daysSince(r.applied_on))}</span>
        {r.work_mode && <span>· {t[r.work_mode as keyof Dict] as string}</span>}
        {r.source && <span>· {r.source}</span>}
        {(r.salary_min || r.salary_max) && (
          <span>
            · {money(r.salary_min, locale)}
            {r.salary_max ? ` - ${money(r.salary_max, locale)}` : ""}
          </span>
        )}
        {r.url && (
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            · {t.url}
          </a>
        )}
        {cvLabel && (
          <a
            href={`/cv/${r.cv_version_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            · CV: {cvLabel}
          </a>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t.notContacted}</span>
          <button
            type="button"
            onClick={() => !r.followed_up && run(() => setFollowedUp(r.id, true))}
            className={`rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80 ${
              r.followed_up ? "bg-ok text-white" : "border border-border text-muted"
            }`}
          >
            {r.followed_up ? `✓ ${t.yes}` : t.yes}
          </button>
          <button
            type="button"
            onClick={() => r.followed_up && run(() => setFollowedUp(r.id, false))}
            className={`rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80 ${
              !r.followed_up ? "bg-muted/20 text-foreground" : "border border-border text-muted"
            }`}
          >
            {t.notYet}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {!r.followed_up && !CLOSED.includes(r.status) && (
            <span className={`text-xs ${overdue ? "font-medium text-warn" : "text-muted"}`}>
              {daysToFollowUp === 0
                ? t.followUpToday
                : daysToFollowUp < 0
                  ? t.followUpDue(-daysToFollowUp)
                  : t.followUpSoon(daysToFollowUp)}
            </span>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="text-xs text-muted transition hover:text-foreground"
          >
            {t.edit}
          </button>
          <button
            type="button"
            onClick={() => (confirming ? run(() => deleteApplication(r.id)) : setConfirming(true))}
            onBlur={() => setConfirming(false)}
            className={`text-xs transition ${confirming ? "font-medium text-bad" : "text-muted hover:text-bad"}`}
          >
            {confirming ? t.confirmDelete : t.delete}
          </button>
        </div>
      </div>
    </article>
  );
}

// Un clic en cualquier parte del campo abre el calendario, no solo en el icono.
const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
  try {
    e.currentTarget.showPicker();
  } catch {}
};

// Fecha con icono propio: Safari en el movil no pone ninguno y Chrome pone el suyo,
// asi que se oculta el nativo y se pinta el mismo en todas partes.
function DateInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className="relative block">
      <input
        type="date"
        onClick={openPicker}
        {...props}
        className="block w-full min-w-0 appearance-none rounded-xl border border-border bg-surface py-3 pl-4 pr-11 text-left text-foreground outline-none focus:border-brand [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-date-and-time-value]:text-left"
      />
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    </span>
  );
}

// Campo con desplegable propio de lo que ya escribiste antes. Sustituye a las
// sugerencias del navegador, que en el movil casi no se ven.
function Suggest({
  name,
  placeholder,
  defaultValue,
  options,
  className,
}: {
  name: string;
  placeholder: string;
  defaultValue: string;
  options: string[];
  className: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  const q = norm(value.trim());
  const matches = options.filter((o) => o !== value && norm(o).includes(q)).slice(0, 6);
  const show = open && matches.length > 0;

  const choose = (option: string) => {
    setValue(option);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        name={name}
        required
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (!show) return;
          if (e.key === "ArrowDown") setActive((active + 1) % matches.length);
          else if (e.key === "ArrowUp") setActive((active - 1 + matches.length) % matches.length);
          else if (e.key === "Enter") choose(matches[active]);
          else if (e.key === "Escape") setOpen(false);
          else return;
          e.preventDefault();
        }}
        className={className}
      />
      {show && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          {matches.map((m, i) => (
            <li key={m} role="option" aria-selected={i === active}>
              <button
                type="button"
                // Sin esto el campo pierde el foco antes del clic y la lista se cierra.
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => choose(m)}
                className={`w-full px-4 py-2.5 text-left text-sm transition ${
                  i === active ? "bg-brand-soft text-brand" : "hover:bg-brand-soft"
                }`}
              >
                {m}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Mismo formulario para crear y para editar: cambia lo que se precarga y a donde se envia.
function ApplicationForm({
  t,
  initial,
  companies,
  roles,
  cvs,
  userId,
  onDone,
}: {
  t: Dict;
  initial: Application | null;
  companies: string[];
  roles: string[];
  cvs: Cv[];
  userId: string;
  onDone: (warning?: string) => void;
}) {
  const { locale } = useLang();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const [noSalary, setNoSalary] = useState(
    initial ? !initial.salary_min && !initial.salary_max : false,
  );
  const [salary, setSalary] = useState({
    min: initial?.salary_min ? String(initial.salary_min) : "",
    max: initial?.salary_max ? String(initial.salary_max) : "",
  });
  const [dates, setDates] = useState(() => {
    const hoy = initial?.applied_on ?? today();
    return { applied: hoy, follow: initial?.follow_up_on ?? plusDays(hoy, 15) };
  });
  const [cvId, setCvId] = useState(initial?.cv_version_id ?? null);
  // Sin ningun CV todavia, el campo de subida se muestra directamente.
  const [uploading, setUploading] = useState(cvs.length === 0);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvLabel, setCvLabel] = useState("");
  const [cvError, setCvError] = useState<string>();

  // El PDF se sube directo del navegador al almacen: no pasa por nuestro servidor
  // (que limita el tamano de lo que recibe). Al servidor solo le llega la ruta.
  // Si la subida falla, la candidatura se guarda igual y se avisa: nunca bloquea.
  async function attachCv(fd: FormData) {
    if (!uploading || !cvFile) {
      if (cvId) fd.set("cv_version_id", cvId);
      return undefined;
    }
    const path = `${userId}/${crypto.randomUUID()}.pdf`;
    const { error } = await supabaseBrowser()
      .storage.from("cvs")
      .upload(path, cvFile, { contentType: "application/pdf" });
    if (error) {
      if (cvId) fd.set("cv_version_id", cvId);
      return t.cvSaveWarning(error.message);
    }
    fd.set("cv_new_path", path);
    fd.set("cv_new_label", cvLabel.trim() || cvFile.name.replace(/\.pdf$/i, ""));
    return undefined;
  }

  // Solo cuenta como "enviado" al editar y con un CV elegido que no se esta sustituyendo.
  const sentCv = initial && !uploading && cvs.some((cv) => cv.id === cvId);

  function pickFile(file: File | undefined) {
    const problem = !file
      ? undefined
      : file.type !== "application/pdf"
        ? t.cvNotPdf
        : file.size > MAX_CV_BYTES
          ? t.cvTooBig
          : undefined;
    setCvError(problem);
    setCvFile(file && !problem ? file : null);
  }

  const field =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand";

  return (
    <form
      className="mt-3 grid gap-3 rounded-2xl border border-border bg-surface p-4"
      action={(fd) =>
        start(async () => {
          const warning = await attachCv(fd);
          const res = initial ? await updateApplication(initial.id, fd) : await addApplication(fd);
          if (res?.error) setError(res.error);
          else onDone(warning);
        })
      }
    >
      <Suggest
        name="company"
        placeholder={t.company}
        defaultValue={initial?.company ?? ""}
        options={companies}
        className={field}
      />
      <Suggest
        name="role"
        placeholder={t.role}
        defaultValue={initial?.role ?? ""}
        options={roles}
        className={field}
      />

      <Chips
        name="work_mode"
        label={t.workMode}
        hint={t.workModeHint}
        options={WORK_MODES}
        labels={t}
        defaultValue={initial?.work_mode ?? undefined}
      />
      <Chips
        name="status"
        label={t.status}
        hint={t.statusHint}
        options={STATUSES}
        labels={t}
        defaultValue={initial?.status ?? "aplicado"}
      />
      <Chips
        name="source"
        label={t.source}
        hint={t.sourceHint}
        options={SOURCES}
        defaultValue={initial?.source ?? undefined}
      />

      <input
        name="url"
        type="url"
        placeholder={`${t.url} (${t.optional})`}
        defaultValue={initial?.url ?? ""}
        className={field}
      />

      <fieldset className="grid gap-2">
        <legend className="text-sm text-muted">{t.salary}</legend>
        <button
          type="button"
          onClick={() => setNoSalary(!noSalary)}
          className={`w-fit ${chip(noSalary)}`}
        >
          {t.notSpecified}
        </button>
        {!noSalary && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="salary_min"
                type="number"
                placeholder={t.min}
                value={salary.min}
                onChange={(e) => setSalary({ ...salary, min: e.target.value })}
                className={field}
              />
              <input
                name="salary_max"
                type="number"
                placeholder={t.max}
                value={salary.max}
                onChange={(e) => setSalary({ ...salary, max: e.target.value })}
                className={field}
              />
            </div>
            {(salary.min || salary.max) && (
              <p className="text-sm text-brand">
                {money(toEuros(salary.min), locale)} - {money(toEuros(salary.max), locale)}
              </p>
            )}
          </>
        )}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid min-w-0 gap-1 text-sm text-muted">
          {t.appliedOn}
          <DateInput
            name="applied_on"
            value={dates.applied}
            onChange={(e) =>
              setDates({ applied: e.target.value, follow: plusDays(e.target.value, 15) })
            }
          />
        </label>

        <label className="grid min-w-0 gap-1 text-sm text-muted">
          {t.followUpOn}
          <DateInput
            name="follow_up_on"
            value={dates.follow}
            onChange={(e) => setDates({ ...dates, follow: e.target.value })}
          />
        </label>
      </div>

      <p className="-mt-1 text-xs text-muted">{t.followUpHint}</p>

      <fieldset className="grid gap-2">
        {/* Al editar una candidatura que ya lleva CV: "CV enviado" en verde. Si no, "Adjuntar". */}
        <legend className={`text-sm ${sentCv ? "font-medium text-ok" : "text-muted"}`}>
          {sentCv ? `✓ ${t.cvSent}` : t.cvAttach}
        </legend>
        {cvs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cvs.map((cv) => {
              const on = !uploading && cvId === cv.id;
              return (
                <button
                  key={cv.id}
                  type="button"
                  onClick={() => {
                    setUploading(false);
                    setCvId(cvId === cv.id ? null : cv.id);
                  }}
                  className={
                    on
                      ? "rounded-full border border-ok bg-ok/10 px-3 py-1.5 text-sm text-ok transition"
                      : chip(false)
                  }
                >
                  {on ? `✓ ${cv.label}` : cv.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setUploading(!uploading)}
              className={chip(uploading)}
            >
              {t.cvUploadNew}
            </button>
          </div>
        )}
        {uploading && (
          <div className="grid gap-2 sm:grid-cols-2">
            {/* Sin name: el archivo no viaja en el formulario, lo sube attachCv */}
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => pickFile(e.target.files?.[0])}
              className={`${field} text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:text-brand`}
            />
            <input
              value={cvLabel}
              onChange={(e) => setCvLabel(e.target.value)}
              placeholder={t.cvTypePlaceholder}
              list="cv-labels"
              className={field}
            />
            <datalist id="cv-labels">
              {cvs.map((cv) => (
                <option key={cv.id} value={cv.label} />
              ))}
            </datalist>
            <p className={`text-xs sm:col-span-2 ${cvError ? "text-bad" : "text-muted"}`}>
              {cvError ?? t.cvHint}
            </p>
          </div>
        )}
      </fieldset>

      {error && <p className="text-sm text-bad">{error}</p>}

      <div className="flex gap-3">
        <button
          disabled={pending}
          className="flex-1 rounded-xl bg-brand px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {t.save}
        </button>
        <button
          type="button"
          onClick={() => onDone()}
          className="rounded-xl border border-border px-4 py-3 text-muted transition hover:text-foreground"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}

function Chips({
  name,
  label,
  hint,
  options,
  labels,
  defaultValue,
}: {
  name: string;
  label: string;
  hint?: string;
  options: readonly string[];
  labels?: Dict;
  defaultValue?: string;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm text-muted">{label}</legend>
      {hint && <p className="-mt-1 text-xs text-muted/80">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o}
              defaultChecked={o === defaultValue}
              className="peer sr-only"
            />
            <span className="block rounded-full border border-border px-3 py-1.5 text-sm transition peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:text-brand">
              {labels ? ((labels[o as keyof Dict] as string) ?? o) : o}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
