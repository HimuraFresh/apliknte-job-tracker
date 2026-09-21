"use client";

import { useState, useTransition } from "react";
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
  const [warning, setWarning] = useState<string>();
  const showForm = open || editing !== null;

  const q = norm(query.trim());
  const visible = q ? rows.filter((r) => norm(`${r.company} ${r.role}`).includes(q)) : rows;
  const cvLabels = new Map(cvs.map((cv) => [cv.id, cv.label]));

  const companies = [...new Set(rows.map((r) => r.company))];
  const roles = [...new Set(rows.map((r) => r.role))];

  const summary = {
    active: rows.filter((r) => !CLOSED.includes(r.status)).length,
    waiting: rows.filter((r) => r.status === "aplicado").length,
    interviews: rows.filter((r) => INTERVIEWING.includes(r.status)).length,
    due: rows.filter(
      (r) =>
        !r.followed_up &&
        !CLOSED.includes(r.status) &&
        daysUntil(r.follow_up_on ?? plusDays(r.applied_on, 15)) <= 0,
    ).length,
  };

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
          <form action={signOut}>
            <button className="rounded-full bg-bad/10 px-3 py-1 text-bad transition hover:bg-bad/20">
              {t.signOut}
            </button>
          </form>
        </div>
      </header>

      {rows.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile n={summary.active} label={t.summaryActive} tone="text-foreground" />
          <Tile n={summary.waiting} label={t.summaryWaiting} tone="text-brand" />
          <Tile n={summary.interviews} label={t.summaryInterviews} tone="text-warn" />
          <Tile n={summary.due} label={t.summaryDue} tone={summary.due ? "text-warn" : "text-muted"} />
        </div>
      )}

      {/* Movil: titulo y boton arriba, buscador debajo a todo lo ancho. Ordenador: los tres en fila. */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <h2 className="order-1 text-lg font-medium">{t.yourApplications}</h2>
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

function Tile({ n, label, tone }: { n: number; label: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-3">
      <p className={`text-2xl font-semibold ${tone}`}>{n}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
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

  // Sin fecha guardada damos por supuestos 15 dias desde que aplicaste.
  // Negativo = ya deberias haber contactado.
  const daysToFollowUp = daysUntil(r.follow_up_on ?? plusDays(r.applied_on, 15));
  const overdue = !r.followed_up && daysToFollowUp <= 0;

  return (
    <article
      className={`relative rounded-2xl border bg-surface p-4 transition ${
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
          {!r.followed_up && (
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
  const [uploading, setUploading] = useState(false);
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
      <input
        name="company"
        required
        placeholder={t.company}
        defaultValue={initial?.company ?? ""}
        list="companies"
        className={field}
      />
      <datalist id="companies">
        {companies.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <input
        name="role"
        required
        placeholder={t.role}
        defaultValue={initial?.role ?? ""}
        list="roles"
        className={field}
      />
      <datalist id="roles">
        {roles.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

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

      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm text-muted">
          {t.appliedOn}
          <input
            name="applied_on"
            type="date"
            value={dates.applied}
            onChange={(e) =>
              setDates({ applied: e.target.value, follow: plusDays(e.target.value, 15) })
            }
            onClick={openPicker}
            className={field}
          />
        </label>

        <label className="grid gap-1 text-sm text-muted">
          {t.followUpOn}
          <input
            name="follow_up_on"
            type="date"
            value={dates.follow}
            onChange={(e) => setDates({ ...dates, follow: e.target.value })}
            onClick={openPicker}
            className={field}
          />
        </label>
      </div>

      <p className="-mt-1 text-xs text-muted">{t.followUpHint}</p>

      <fieldset className="grid gap-2">
        <legend className="text-sm text-muted">{t.cvSection}</legend>
        <div className="flex flex-wrap gap-2">
          {cvs.map((cv) => (
            <button
              key={cv.id}
              type="button"
              onClick={() => {
                setUploading(false);
                setCvId(cvId === cv.id ? null : cv.id);
              }}
              className={chip(!uploading && cvId === cv.id)}
            >
              {cv.label}
            </button>
          ))}
          <button type="button" onClick={() => setUploading(!uploading)} className={chip(uploading)}>
            {t.cvUploadNew}
          </button>
        </div>
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
