"use client";

import { useState, useTransition } from "react";
import { useLang, setLocale } from "@/lib/lang";
import { STATUSES, WORK_MODES, SOURCES, type Dict } from "@/lib/dict";
import { addApplication } from "@/app/panel/actions";
import { signOut } from "@/app/entrar/actions";

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
};

const daysSince = (isoDate: string) =>
  Math.max(
    0,
    Math.round((Date.now() - new Date(isoDate + "T00:00:00").getTime()) / 86400000),
  );

const STATUS_TONE: Record<string, string> = {
  aplicado: "bg-brand-soft text-brand",
  cribado: "bg-brand-soft text-brand",
  entrevista_1: "bg-warn/15 text-warn",
  entrevista_2: "bg-warn/15 text-warn",
  entrevista_3: "bg-warn/15 text-warn",
  oferta: "bg-ok/15 text-ok",
  rechazado: "bg-bad/10 text-bad",
  retirado: "bg-muted/15 text-muted",
};

export default function Panel({ rows }: { rows: Application[] }) {
  const { t, locale } = useLang();
  const [open, setOpen] = useState(false);

  const companies = [...new Set(rows.map((r) => r.company))];
  const roles = [...new Set(rows.map((r) => r.role))];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-5 sm:p-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.appName}</h1>
          <p className="text-sm text-muted">
            {rows.length} {t.total}
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
            <button className="transition hover:text-foreground">{t.signOut}</button>
          </form>
        </div>
      </header>

      <button
        onClick={() => setOpen(!open)}
        className="mt-6 w-full rounded-2xl bg-brand px-5 py-4 text-left font-medium text-white transition hover:opacity-90"
      >
        + {t.newApplication}
      </button>

      {open && (
        <NewForm
          t={t}
          companies={companies}
          roles={roles}
          onDone={() => setOpen(false)}
        />
      )}

      <section className="mt-6 grid gap-3">
        {rows.length === 0 && !open && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
            {t.empty}
          </p>
        )}

        {rows.map((r) => (
          <article
            key={r.id}
            className="rounded-2xl border border-border bg-surface p-4 transition hover:border-brand"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-medium">{r.role}</h2>
                <p className="truncate text-sm text-muted">{r.company}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  STATUS_TONE[r.status] ?? "bg-muted/15 text-muted"
                }`}
              >
                {t[r.status as keyof Dict] as string}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span>{t.daysAgo(daysSince(r.applied_on))}</span>
              {r.work_mode && <span>· {t[r.work_mode as keyof Dict] as string}</span>}
              {r.source && <span>· {r.source}</span>}
              {(r.salary_min || r.salary_max) && (
                <span>
                  · {r.salary_min ?? "?"}-{r.salary_max ?? "?"}k
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
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function NewForm({
  t,
  companies,
  roles,
  onDone,
}: {
  t: Dict;
  companies: string[];
  roles: string[];
  onDone: () => void;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();

  const field =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand";

  return (
    <form
      className="mt-3 grid gap-3 rounded-2xl border border-border bg-surface p-4"
      action={(fd) =>
        start(async () => {
          const res = await addApplication(fd);
          if (res?.error) setError(res.error);
          else onDone();
        })
      }
    >
      <input name="company" required placeholder={t.company} list="companies" className={field} />
      <datalist id="companies">
        {companies.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <input name="role" required placeholder={t.role} list="roles" className={field} />
      <datalist id="roles">
        {roles.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      <Chips name="work_mode" label={t.workMode} options={WORK_MODES} labels={t} />
      <Chips name="status" label={t.status} options={STATUSES} labels={t} defaultValue="aplicado" />
      <Chips name="source" label={t.source} options={SOURCES} />

      <input name="url" type="url" placeholder={`${t.url} (${t.optional})`} className={field} />

      <div className="grid grid-cols-2 gap-3">
        <input name="salary_min" type="number" placeholder={`${t.salary} min`} className={field} />
        <input name="salary_max" type="number" placeholder="max" className={field} />
      </div>

      <label className="grid gap-1 text-sm text-muted">
        {t.appliedOn}
        <input
          name="applied_on"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={field}
        />
      </label>

      <label className="grid gap-1 text-sm text-muted">
        {t.followUpOn} ({t.optional})
        <input name="follow_up_on" type="date" className={field} />
      </label>

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
          onClick={onDone}
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
  options,
  labels,
  defaultValue,
}: {
  name: string;
  label: string;
  options: readonly string[];
  labels?: Dict;
  defaultValue?: string;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm text-muted">{label}</legend>
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
