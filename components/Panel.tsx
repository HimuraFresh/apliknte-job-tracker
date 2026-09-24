"use client";

import { useId, useState, useTransition } from "react";
import { useLang } from "@/lib/lang";
import { STATUSES, WORK_MODES, SOURCES, type Dict } from "@/lib/dict";
import { money, toEuros } from "@/lib/money";
import { daysSince, daysUntil, plusDays, today } from "@/lib/dates";
import { groupBy, norm } from "@/lib/group";
import { COMPANIES } from "@/lib/companies";
import {
  addApplication,
  updateApplication,
  deleteApplication,
  setFollowedUp,
  setFollowUp,
  setStatus,
} from "@/app/panel/actions";
import Logo from "@/components/Logo";
import SuggestionPanel from "@/components/SuggestionPanel";
import AppMenu from "@/components/AppMenu";
import Refresh from "@/components/Refresh";
import CvPanel from "@/components/CvPanel";
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
  notes: string | null;
};

export type Cv = { id: string; label: string };

const MAX_CV_BYTES = 5 * 1024 * 1024;

// Aspecto comun de los botones tipo "globito" que se marcan y desmarcan. En los filtros,
// la palabra elegida va en el color de texto principal (blanco en oscuro) para que resalte.
const chip = (on: boolean, onText = "text-brand") =>
  `rounded-full border px-3 py-1.5 text-sm transition ${
    on ? `border-brand bg-brand-soft ${onText}` : "border-border text-muted hover:text-foreground"
  }`;

const STATUS_TONE: Record<string, string> = {
  aplicado: "bg-brand-soft text-brand",
  cribado: "bg-brand/20 text-brand-strong",
  entrevista_1: "bg-warn/15 text-warn",
  entrevista_2: "bg-warn/20 text-warn",
  entrevista_3: "bg-warn/25 text-warn",
  oferta: "bg-ok/20 text-ok",
  contratado: "bg-ok text-on-solid",
  rechazado: "bg-bad/15 text-bad",
  retirado: "bg-muted/15 text-muted",
};

const tone = (status: string) => STATUS_TONE[status] ?? "bg-muted/15 text-muted";

const CLOSED = ["contratado", "rechazado", "retirado"];
const INTERVIEWING = ["cribado", "entrevista_1", "entrevista_2", "entrevista_3"];
// No se mezclan con las vivas: se miran aparte, con el boton "Rechazadas".
const DISMISSED = ["rechazado", "retirado"];

// Sin fecha de seguimiento no avisamos: asi se apaga el aviso ("no hace falta contactar").
const isDue = (r: Application) =>
  !!r.follow_up_on &&
  !r.followed_up &&
  !CLOSED.includes(r.status) &&
  daysUntil(r.follow_up_on) <= 0;

// Cada recuadro del resumen cuenta y filtra con la misma regla.
const FILTERS = {
  active: (r: Application) => !CLOSED.includes(r.status),
  waiting: (r: Application) => r.status === "aplicado",
  interviews: (r: Application) => INTERVIEWING.includes(r.status),
  due: isDue,
};
type Filter = keyof typeof FILTERS;

type Option = { id: string; label: string; match: (r: Application) => boolean };

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
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersId = useId();
  const [view, setView] = useState<"list" | "company" | "role">("list");
  // Al tocar una empresa o un puesto en la vista agrupada: solo ese, por nombre exacto.
  const [only, setOnly] = useState<{ by: "company" | "role"; name: string } | null>(null);
  const [warning, setWarning] = useState<string>();
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [cvsOpen, setCvsOpen] = useState(false);
  // La candidatura abierta: dentro de su ficha en el movil, en el panel derecho en el ordenador.
  const [openId, setOpenId] = useState<string | null>(null);
  const [showDismissed, setShowDismissed] = useState(false);
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

  // Filtros extra. Como en los recuadros, la misma regla sirve para filtrar y para
  // contar, y las opciones que se quedan a 0 no se muestran.
  const facets = (
    [
      {
        key: "mode",
        label: t.workMode,
        options: WORK_MODES.map((m) => ({ id: m, label: t[m], match: (r) => r.work_mode === m })),
      },
      {
        key: "source",
        label: t.source,
        options: SOURCES.map((s) => ({ id: s, label: s, match: (r) => r.source === s })),
      },
      {
        key: "date",
        label: t.appliedOn,
        options: [7, 30, 90].map((d) => ({
          id: String(d),
          label: t.lastDays(d),
          match: (r) => daysSince(r.applied_on) <= d,
        })),
      },
    ] satisfies { key: string; label: string; options: Option[] }[]
  ).map((f) => ({
    ...f,
    options: f.options
      .map((o: Option) => ({ ...o, n: rows.filter(o.match).length }))
      .filter((o) => o.n > 0),
  }));
  const active = facets.flatMap((f) =>
    f.options.filter((o) => chosen[f.key] === o.id).map((o) => ({ ...o, facet: f.key })),
  );

  const q = norm(query.trim());
  const dismissed = rows.filter((r) => DISMISSED.includes(r.status)).length;
  const visible = rows.filter(
    (r) =>
      DISMISSED.includes(r.status) === showDismissed &&
      (!filter || FILTERS[filter.key](r)) &&
      (!only || norm(r[only.by].trim()) === norm(only.name.trim())) &&
      active.every((o) => o.match(r)) &&
      (!q || norm(`${r.company} ${r.role}`).includes(q)),
  );

  // Todo lo que esta filtrando ahora mismo, cada cosa con su ✕ para quitarla.
  const pills = [
    ...(filter ? [{ key: "tile", label: filter.label, clear: () => setPicked(null) }] : []),
    ...(only
      ? [
          {
            key: "only",
            label: `${only.by === "company" ? t.company : t.role}: ${only.name}`,
            clear: () => setOnly(null),
          },
        ]
      : []),
    ...active.map((o) => ({
      key: o.facet,
      label: o.label,
      clear: () => setChosen({ ...chosen, [o.facet]: "" }),
    })),
  ];
  const cvLabels = new Map(cvs.map((cv) => [cv.id, cv.label]));
  const selected = visible.find((r) => r.id === openId);

  const companies = [...new Set(rows.map((r) => r.company))];
  const roles = [...new Set(rows.map((r) => r.role))];


  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-5 sm:p-8 lg:max-w-5xl">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl">
            <Logo />
          </h1>
          <p className="text-sm text-muted">
            {rows.length} {rows.length === 1 ? t.totalOne : t.total}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Refresh />
          <AppMenu
            onSuggest={() => {
              setCvsOpen(false);
              setSuggestOpen(true);
            }}
            onCvs={() => {
              setSuggestOpen(false);
              setCvsOpen(true);
            }}
          />
        </div>
      </header>

      {suggestOpen && <SuggestionPanel onClose={() => setSuggestOpen(false)} />}
      {cvsOpen && <CvPanel cvs={cvs} userId={userId} onClose={() => setCvsOpen(false)} />}

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
        <h2 className="order-1 text-lg font-medium">{t.yourApplications}</h2>
        {!showForm && rows.length > 0 && (
          <div className="order-3 flex w-full gap-2 sm:order-2 sm:w-auto sm:flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search}
              aria-label={t.search}
              // 16px en el movil: con menos, el iPhone hace zoom al tocar el campo.
              className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-base outline-none focus:border-brand sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
              className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm transition ${
                filtersOpen || active.length > 0
                  ? "border-brand text-brand"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {t.filters}
              {active.length > 0 && ` · ${active.length}`}
            </button>
          </div>
        )}
        <button
          onClick={() => {
            setEditing(null);
            setOpen(!open);
          }}
          className="order-2 ml-auto shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-on-solid transition hover:opacity-90 sm:order-3 sm:ml-0"
        >
          {showForm ? t.cancel : `+ ${t.newApplication}`}
        </button>
      </div>

      {/* Cada grupo en su fila: el nombre y sus globitos seguidos. El nombre tiene ancho
          fijo para que en el ordenador los globitos queden alineados; en el movil, los que
          no caben siguen debajo usando todo el ancho. */}
      {!showForm && filtersOpen && rows.length > 0 && (
        <div className="mt-3 grid gap-3 rounded-2xl border border-border bg-surface p-4">
          {facets
            .filter((f) => f.options.length > 0)
            .map((f) => (
              <div
                key={f.key}
                role="group"
                aria-labelledby={`${filtersId}-${f.key}`}
                className="flex flex-wrap items-center gap-2"
              >
                <span id={`${filtersId}-${f.key}`} className="min-w-[5.5rem] text-sm text-muted">
                  {f.label}
                </span>
                {f.options.map((o) => {
                  const on = chosen[f.key] === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setChosen({ ...chosen, [f.key]: on ? "" : o.id })}
                      className={chip(on, "text-foreground")}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            ))}
        </div>
      )}

      {!showForm && rows.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-brand-soft/60 p-1">
            {(
              [
                ["list", t.viewList],
                ["company", t.viewCompanies],
                ["role", t.viewRoles],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`tap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  view === v ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {dismissed > 0 && (
            <button
              type="button"
              aria-pressed={showDismissed}
              onClick={() => {
                setShowDismissed(!showDismissed);
                setPicked(null);
              }}
              className={`tap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                showDismissed
                  ? "border-bad bg-bad/10 text-bad"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {t.viewRejected}
            </button>
          )}
          {pills.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={p.clear}
              aria-label={`${t.clearFilter}: ${p.label}`}
              className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand transition hover:bg-brand/20"
            >
              {p.label} ✕
            </button>
          ))}
          {/* Cuantas quedan con la busqueda y los filtros de ahora */}
          {visible.length !== rows.length && (
            <span className="ml-auto text-xs text-muted">{t.shown(visible.length, rows.length)}</span>
          )}
        </div>
      )}

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
        <div
          role="status"
          className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-warn/40 bg-warn/10 p-4 text-sm text-warn"
        >
          <p>{warning}</p>
          <button onClick={() => setWarning(undefined)} aria-label={t.cancel} className="shrink-0">
            ✕
          </button>
        </div>
      )}

      {/* Ordenador: lista a la izquierda y la ficha elegida fija a la derecha. Movil: solo
          la lista, y los detalles se abren dentro de la propia ficha. */}
      {!showForm && (
        <div className="mt-4 lg:flex lg:items-start lg:gap-4">
        <section className="grid gap-3 lg:min-w-0 lg:flex-1">
          {rows.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
              {t.empty}
            </p>
          )}

          {rows.length > 0 && visible.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
              {q ? t.noResults(query.trim()) : t.noMatches}
            </p>
          )}

          {view === "list"
            ? visible.map((r) => (
                <Card
                  key={r.id}
                  r={r}
                  t={t}
                  locale={locale}
                  cvLabel={r.cv_version_id ? cvLabels.get(r.cv_version_id) : undefined}
                  open={openId === r.id}
                  onToggle={() => setOpenId(openId === r.id ? null : r.id)}
                  onEdit={() => {
                    setWarning(undefined);
                    setEditing(r);
                  }}
                />
              ))
            : groupBy(visible, view).map((g) => (
                <Group
                  key={norm(g[0][view].trim())}
                  rows={g}
                  by={view}
                  t={t}
                  onPick={() => {
                    setOnly({ by: view, name: g[0][view] });
                    setView("list");
                  }}
                />
              ))}
        </section>

        {view === "list" && rows.length > 0 && (
          <aside className="sticky top-6 hidden w-[22rem] shrink-0 lg:block">
            {selected ? (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <h2 className="font-medium">{selected.role}</h2>
                <p className="break-words text-sm text-muted">
                  {selected.company}{" "}
                  <span className="whitespace-nowrap">
                    · {t.daysAgo(daysSince(selected.applied_on))}
                  </span>
                </p>
                <div className="mt-3 border-t border-border pt-3">
                  <Details
                    r={selected}
                    t={t}
                    locale={locale}
                    cvLabel={
                      selected.cv_version_id ? cvLabels.get(selected.cv_version_id) : undefined
                    }
                    onEdit={() => {
                      setWarning(undefined);
                      setEditing(selected);
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
                {t.pickOne}
              </p>
            )}
          </aside>
        )}
        </div>
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

// Una empresa (o un puesto) con cuantas candidaturas tiene. Al tocarla se ven todas.
// El nombre es el de la mas reciente: las filas llegan de la mas nueva a la mas antigua.
function Group({
  rows,
  by,
  t,
  onPick,
}: {
  rows: Application[];
  by: "company" | "role";
  t: Dict;
  onPick: () => void;
}) {
  const name = rows[0][by];
  return (
    <button
      type="button"
      onClick={onPick}
      aria-label={`${name}: ${rows.length} ${rows.length === 1 ? t.totalOne : t.total}`}
      className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3 text-left transition hover:border-brand"
    >
      <span className="truncate font-medium">{name}</span>
      <span className="shrink-0 text-lg font-semibold text-brand">{rows.length}</span>
    </button>
  );
}

function Card({
  r,
  t,
  locale,
  cvLabel,
  open,
  onToggle,
  onEdit,
}: {
  r: Application;
  t: Dict;
  locale: string;
  cvLabel?: string;
  open: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const [pending, start] = useTransition();
  const [picking, setPicking] = useState(false);
  const [nudging, setNudging] = useState(false);
  const run = (fn: () => Promise<unknown>) => start(() => void fn());

  // Negativo = ya deberias haber contactado.
  const daysToFollowUp = r.follow_up_on ? daysUntil(r.follow_up_on) : 0;
  const overdue = isDue(r);

  return (
    <article
      className={`relative min-w-0 rounded-2xl border bg-surface p-4 transition ${
        overdue ? "border-warn/60" : "border-border hover:border-brand"
      } ${open ? "ring-1 ring-brand" : ""} ${pending ? "opacity-60" : ""}`}
    >
      {/* Cerrada, solo lo esencial y el aviso de seguimiento. La cabecera abre los detalles
          (solo para verlos: para cambiarlos esta Editar). El estado se cambia aparte. */}
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="min-w-0 flex-1 text-left"
        >
          <h2 className="truncate font-medium">{r.role}</h2>
          {/* Sin cortar nada: si no cabe, "· hace 18 dias" baja entero a la linea siguiente */}
          <p className="break-words text-sm text-muted">
            {r.company}{" "}
            <span className="whitespace-nowrap">· {t.daysAgo(daysSince(r.applied_on))}</span>
          </p>
        </button>

        <div className="relative flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setPicking(!picking)}
            className={`tap rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80 ${tone(r.status)}`}
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
          {/* La flecha tambien abre y cierra; para el lector de pantalla ya esta la cabecera */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={onToggle}
            className="tap p-1 text-muted transition hover:text-foreground"
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Fuera solo avisa cuando hay que actuar ("Contactar en X dias" va dentro). Al tocarlo
          se aplaza o se apaga: hay empresas a las que no hay a quien escribir. */}
      {overdue && (
        <div className="relative mt-1">
          <button
            type="button"
            onClick={() => setNudging(!nudging)}
            aria-expanded={nudging}
            className="tap text-left text-xs font-medium text-warn underline decoration-dotted underline-offset-4"
          >
            {daysToFollowUp === 0 ? t.followUpToday : t.followUpDue(-daysToFollowUp)}
          </button>
          {nudging && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNudging(false)} />
              <div className="absolute left-0 z-20 mt-2 grid w-60 gap-1 rounded-2xl border border-border bg-surface p-2 shadow-xl">
                {/* Aplazar cuenta desde hoy, no desde que aplicaste. Volver a activarlo
                    desde la ficha si pone el plazo normal de la app, 15 dias. */}
                {[
                  { label: t.remindLater, date: plusDays(today(), 7) as string | null },
                  { label: t.noFollowUp, date: null },
                ].map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => {
                      setNudging(false);
                      run(() => setFollowUp(r.id, o.date));
                    }}
                    className="rounded-xl px-3 py-2 text-left text-sm transition hover:bg-brand-soft"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* En el movil los detalles se abren aqui; en el ordenador van al panel de la derecha */}
      {open && (
        <div className="mt-3 border-t border-border pt-3 lg:hidden">
          <Details r={r} t={t} locale={locale} cvLabel={cvLabel} onEdit={onEdit} />
        </div>
      )}
    </article>
  );
}

// Los detalles de una candidatura, sin su cabecera: dentro de la ficha en el movil y en
// el panel fijo de la derecha en el ordenador.
function Details({
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
  const [confirming, setConfirming] = useState(false);
  const run = (fn: () => Promise<unknown>) => start(() => void fn());

  const daysToFollowUp = r.follow_up_on ? daysUntil(r.follow_up_on) : 0;
  const overdue = isDue(r);
  const salary =
    r.salary_min || r.salary_max
      ? `${money(r.salary_min, locale)}${r.salary_max ? ` - ${money(r.salary_max, locale)}` : ""}`
      : null;
  const hasDetails = r.work_mode || r.source || salary || r.url || cvLabel;

  return (
    <>
      <div className={`grid gap-4 ${pending ? "opacity-60" : ""}`}>
          {hasDetails && (
            <div className="grid grid-cols-2 gap-x-5">
              <dl className="grid content-start gap-3">
                {r.work_mode && (
                  <Detail label={t.workMode}>{t[r.work_mode as keyof Dict] as string}</Detail>
                )}
                {r.source && <Detail label={t.source}>{r.source}</Detail>}
                {salary && <Detail label={t.salaryShort}>{salary}</Detail>}
              </dl>
              <dl className="grid content-start gap-3">
                {r.url && (
                  <Detail label={t.offer}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline"
                    >
                      {t.viewOffer} ↗
                    </a>
                  </Detail>
                )}
                {cvLabel && (
                  <Detail label={t.cvSent}>
                    <a
                      href={`/cv/${r.cv_version_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline"
                    >
                      {cvLabel} ↗
                    </a>
                  </Detail>
                )}
              </dl>
            </div>
          )}

          {r.notes && (
            <div className="rounded-xl bg-background p-3">
              <p className="text-xs text-muted">{t.note}</p>
              <p className="whitespace-pre-wrap break-words text-sm">{r.notes}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted">{t.notContacted}</span>
              <button
                type="button"
                onClick={() => !r.followed_up && run(() => setFollowedUp(r.id, true))}
                className={`tap rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80 ${
                  r.followed_up ? "bg-ok text-on-solid" : "border border-border text-muted"
                }`}
              >
                {r.followed_up ? `✓ ${t.yes}` : t.yes}
              </button>
              <button
                type="button"
                onClick={() => r.followed_up && run(() => setFollowedUp(r.id, false))}
                className={`tap rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80 ${
                  !r.followed_up ? "bg-muted/20 text-foreground" : "border border-border text-muted"
                }`}
              >
                {t.notYet}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {!overdue &&
                !r.followed_up &&
                !CLOSED.includes(r.status) &&
                (r.follow_up_on ? (
                  <span className="text-xs text-muted">{t.followUpSoon(daysToFollowUp)}</span>
                ) : (
                  <span className="text-xs text-muted">
                    {t.followUpOff}{" "}
                    <button
                      type="button"
                      onClick={() => run(() => setFollowUp(r.id, plusDays(today(), 15)))}
                      className="tap text-brand transition hover:underline"
                    >
                      {t.followUpBack}
                    </button>
                  </span>
                ))}
              <button
                type="button"
                onClick={onEdit}
                className="tap py-1 text-xs text-muted transition hover:text-foreground"
              >
                {t.edit}
              </button>
              <button
                type="button"
                onClick={() =>
                  confirming ? run(() => deleteApplication(r.id)) : setConfirming(true)
                }
                onBlur={() => setConfirming(false)}
                className={`tap py-1 text-xs transition ${confirming ? "font-medium text-bad" : "text-muted hover:text-bad"}`}
              >
                {confirming ? t.confirmDelete : t.delete}
              </button>
            </div>
          </div>
      </div>
    </>
  );
}

// Un dato de la ficha abierta: etiqueta pequeña encima y el valor algo mas grande.
function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="break-words text-[15px]">{children}</dd>
    </div>
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
        className="block w-full min-w-0 appearance-none rounded-xl border border-border bg-surface py-3 pl-4 pr-11 text-left text-base text-foreground outline-none focus:border-brand [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-date-and-time-value]:text-left"
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
  more = [],
  className,
}: {
  name: string;
  placeholder: string;
  defaultValue: string;
  options: string[];
  more?: readonly string[];
  className: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  const q = norm(value.trim());
  const hit = (o: string) => o !== value && norm(o).includes(q);
  // Primero lo que ya usaste. Las de "more" (empresas precargadas) solo salen al escribir,
  // sin repetir las tuyas, y antes las que empiezan por lo escrito o tienen una palabra
  // que empieza asi: con "ib", Iberia antes que Agencia Tributaria.
  const rank = (o: string) => (norm(o).startsWith(q) ? 0 : norm(o).includes(` ${q}`) ? 1 : 2);
  const mine = new Set(options.map(norm));
  const extra = q
    ? more.filter((m) => !mine.has(norm(m)) && hit(m)).sort((a, b) => rank(a) - rank(b))
    : [];
  const matches = [...options.filter(hit), ...extra].slice(0, 6);
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
        // El texto de dentro desaparece al escribir; esto lo sigue leyendo el lector de pantalla.
        aria-label={placeholder}
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
  // Escondidas tras un boton para no alargar el formulario a quien no las usa.
  const [showNotes, setShowNotes] = useState(Boolean(initial?.notes));

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
        more={COMPANIES}
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
        aria-label={t.url}
        defaultValue={initial?.url ?? ""}
        className={field}
      />

      <fieldset className="grid gap-2">
        <legend className="text-sm text-muted">{t.salary}</legend>
        <p className="-mt-1 text-xs text-muted">{t.salaryHint}</p>
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

      {showNotes ? (
        <label className="grid gap-1 text-sm text-muted">
          {t.note}
          <textarea
            name="notes"
            defaultValue={initial?.notes ?? ""}
            maxLength={2000}
            rows={3}
            placeholder={t.notePlaceholder}
            // Al pulsar "+ Añadir nota" se escribe directamente; al editar una que ya
            // existe no se roba el foco.
            autoFocus={!initial?.notes}
            className={`${field} resize-y text-base text-foreground`}
          />
        </label>
      ) : (
        <button type="button" onClick={() => setShowNotes(true)} className={`w-fit ${chip(false)}`}>
          {t.addNote}
        </button>
      )}

      {error && (
        <p role="alert" className="text-sm text-bad">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          disabled={pending}
          className="flex-1 rounded-xl bg-brand px-4 py-3 font-medium text-on-solid transition hover:opacity-90 disabled:opacity-50"
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
      {hint && <p className="-mt-1 text-xs text-muted">{hint}</p>}
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
