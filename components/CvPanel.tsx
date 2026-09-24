"use client";

import { useState, useTransition } from "react";
import { useLang } from "@/lib/lang";
import { replaceCv, deleteCv } from "@/app/panel/actions";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Cv } from "@/components/Panel";

const MAX_CV_BYTES = 5 * 1024 * 1024;

// "Mis CVs" del menu: ver cada PDF (el navegador lo abre), descargarlo o cambiarlo por
// otro. Cambiar mantiene el tipo, asi que las candidaturas que lo usaban siguen igual.
export default function CvPanel({
  cvs,
  uses,
  userId,
  onClose,
}: {
  cvs: Cv[];
  // cuantas candidaturas usan cada CV, para avisar antes de borrarlo
  uses: Record<string, number>;
  userId: string;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string }>();
  const [confirming, setConfirming] = useState<string>();

  // Borrar pide dos toques, como en las candidaturas. El primero dice a cuantas
  // candidaturas les va a quitar el CV: se quedan sin el, pero no se borran.
  function remove(id: string) {
    if (confirming !== id) {
      setConfirming(id);
      setMessage({ ok: false, text: t.cvInUse(uses[id] ?? 0) });
      return;
    }
    setConfirming(undefined);
    setMessage(undefined);
    start(async () => {
      const res = await deleteCv(id);
      setMessage(
        res.error ? { ok: false, text: t.cvDeleteFailed } : { ok: true, text: t.cvDeleted },
      );
    });
  }

  function replace(id: string, file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") return setMessage({ ok: false, text: t.cvNotPdf });
    if (file.size > MAX_CV_BYTES) return setMessage({ ok: false, text: t.cvTooBig });

    start(async () => {
      // Igual que al adjuntarlo en el formulario: sube directo del navegador a su carpeta.
      const path = `${userId}/${crypto.randomUUID()}.pdf`;
      const { error } = await supabaseBrowser()
        .storage.from("cvs")
        .upload(path, file, { contentType: "application/pdf" });
      const res = error ? { error: error.message } : await replaceCv(id, path);
      setMessage(res.error ? { ok: false, text: t.cvReplaceFailed } : { ok: true, text: t.cvReplaced });
    });
  }

  const link = "tap text-brand transition hover:underline";

  return (
    <section className="mt-4 grid gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium">{t.myCvs}</h2>
        <button type="button" onClick={onClose} aria-label={t.cancel} className="tap px-1 text-muted">
          ✕
        </button>
      </div>

      {cvs.length === 0 ? (
        <p className="text-sm text-muted">{t.cvNone}</p>
      ) : (
        <ul className={`grid divide-y divide-border ${pending ? "opacity-60" : ""}`}>
          {cvs.map((cv) => (
            <li key={cv.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
              <span className="min-w-0 break-words">{cv.label}</span>
              <span className="flex items-center gap-4 text-sm">
                <a href={`/cv/${cv.id}`} target="_blank" rel="noopener noreferrer" className={link}>
                  {t.cvView} ↗
                </a>
                <a href={`/cv/${cv.id}?download`} className={link}>
                  {t.cvDownload}
                </a>
                <label className={`${link} cursor-pointer`}>
                  {t.cvReplace}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    disabled={pending}
                    onChange={(e) => {
                      replace(cv.id, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => remove(cv.id)}
                  onBlur={() => confirming === cv.id && setConfirming(undefined)}
                  className={`tap transition ${
                    confirming === cv.id ? "font-medium text-bad" : "text-muted hover:text-bad"
                  }`}
                >
                  {confirming === cv.id ? t.confirmDelete : t.delete}
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`text-sm ${message.ok ? "text-ok" : "text-bad"}`}
        >
          {message.text}
        </p>
      )}
    </section>
  );
}
