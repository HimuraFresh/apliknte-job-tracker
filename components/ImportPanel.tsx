"use client";

import { useState, useTransition } from "react";
import { useLang } from "@/lib/lang";
import { parse, mapRows, type Mapped } from "@/lib/importar";
import { importApplications } from "@/app/panel/actions";
import type { Cv } from "@/components/Panel";
import type { Dict } from "@/lib/dict";

const MAX_BYTES = 2 * 1024 * 1024;
export const MAX_ROWS = 300;

// Importar de una hoja de calculo. Tres formas de traerla, porque cada uno tiene la suya:
// arrastrar el archivo, elegirlo, o pegar las celdas copiadas (Excel y Sheets ponen en el
// portapapeles una tabla separada por tabuladores, que sabemos leer igual).
export default function ImportPanel({
  cvs,
  onClose,
}: {
  cvs: Cv[];
  onClose: () => void;
}) {
  const { t } = useLang();
  const [pending, start] = useTransition();
  const [mapped, setMapped] = useState<Mapped>();
  const [problem, setProblem] = useState<string>();
  const [done, setDone] = useState<number>();
  const [over, setOver] = useState(false);

  function read(text: string) {
    setProblem(undefined);
    setDone(undefined);
    const result = mapRows(parse(text), cvs);
    if (result.drafts.length === 0) {
      setMapped(undefined);
      setProblem(t.importNothing);
      return;
    }
    setMapped(result);
  }

  async function readFile(file: File | undefined) {
    if (!file) return;
    // Un .xlsx es un zip por dentro: no se puede leer sin traer una libreria entera.
    if (/\.xlsx?$/i.test(file.name)) return setProblem(t.importXlsx);
    if (file.size > MAX_BYTES) return setProblem(t.importTooBig);
    read(await file.text());
  }

  function save() {
    if (!mapped) return;
    start(async () => {
      const res = await importApplications(mapped.drafts.slice(0, MAX_ROWS));
      if (res.error) return setProblem(t.importFailed);
      setDone(res.added ?? 0);
      setMapped(undefined);
    });
  }

  return (
    <section className="mt-4 grid gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium">{t.importTitle}</h2>
        <button type="button" onClick={onClose} aria-label={t.cancel} className="tap px-1 text-muted">
          ✕
        </button>
      </div>

      {done !== undefined ? (
        <p role="status" className="text-sm text-ok">
          {t.importDone(done)}
        </p>
      ) : (
        <>
          <p className="text-sm text-muted">{t.importIntro}</p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              void readFile(e.dataTransfer.files[0]);
            }}
            className={`grid gap-2 rounded-xl border border-dashed p-5 text-center text-sm transition ${
              over ? "border-brand bg-brand-soft" : "border-border"
            }`}
          >
            <p className="text-muted">
              {t.importDrop}{" "}
              <label className="tap cursor-pointer text-brand hover:underline">
                {t.importChoose}
                <input
                  type="file"
                  accept=".csv,.tsv,.txt,text/csv,text/plain"
                  className="sr-only"
                  onChange={(e) => {
                    void readFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </p>
            <p className="text-xs text-muted">{t.importHint}</p>
          </div>

          <textarea
            rows={3}
            placeholder={t.importPaste}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text");
              if (text.trim()) {
                e.preventDefault();
                read(text);
              }
            }}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-brand sm:text-sm"
          />

          {problem && (
            <p role="alert" className="text-sm text-bad">
              {problem}
            </p>
          )}

          {mapped && <Preview mapped={mapped} t={t} pending={pending} onSave={save} />}
        </>
      )}
    </section>
  );
}

// Lo que se va a guardar, antes de guardarlo: cuantas son, las primeras cinco y que
// columnas se han quedado fuera. Nada se escribe hasta que lo apruebas.
function Preview({
  mapped,
  t,
  pending,
  onSave,
}: {
  mapped: Mapped;
  t: Dict;
  pending: boolean;
  onSave: () => void;
}) {
  const total = Math.min(mapped.drafts.length, MAX_ROWS);
  const first = mapped.drafts.slice(0, 5);

  return (
    <div className={`grid gap-3 ${pending ? "opacity-60" : ""}`}>
      <p className="font-medium">{t.importFound(mapped.drafts.length)}</p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="py-1 pr-3 font-normal">{t.company}</th>
              <th className="py-1 pr-3 font-normal">{t.role}</th>
              <th className="py-1 pr-3 font-normal">{t.status}</th>
              <th className="py-1 font-normal">{t.appliedOn}</th>
            </tr>
          </thead>
          <tbody>
            {first.map((d, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-1.5 pr-3">{d.company}</td>
                <td className="py-1.5 pr-3">{d.role}</td>
                <td className="py-1.5 pr-3">{t[d.status as keyof Dict] as string}</td>
                <td className="py-1.5 whitespace-nowrap">{d.applied_on}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mapped.drafts.length > first.length && (
        <p className="text-xs text-muted">{t.importMore(mapped.drafts.length - first.length)}</p>
      )}
      {mapped.ignored.length > 0 && (
        <p className="text-xs text-muted">{t.importIgnored(mapped.ignored.join(", "))}</p>
      )}
      {mapped.drafts.length > MAX_ROWS && <p className="text-xs text-warn">{t.importTooMany(MAX_ROWS)}</p>}

      <button
        type="button"
        onClick={onSave}
        disabled={pending}
        className="w-fit rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-on-solid transition hover:opacity-90 disabled:opacity-50"
      >
        {t.importDo(total)}
      </button>
    </div>
  );
}
