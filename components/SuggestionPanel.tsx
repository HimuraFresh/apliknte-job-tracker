"use client";

import { useState, useTransition } from "react";
import { useLang } from "@/lib/lang";
import { sendFeedback } from "@/app/panel/actions";

const KINDS = [
  { key: "idea", label: "kindIdea" },
  { key: "error", label: "kindError" },
  { key: "duda", label: "kindDuda" },
] as const;

// Formulario de sugerencias: el mensaje se guarda en la tabla feedback de Supabase.
export default function SuggestionPanel({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const [kind, setKind] = useState<(typeof KINDS)[number]["key"]>("idea");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<"sent" | "failed">();
  const [pending, start] = useTransition();

  if (result === "sent") {
    return (
      <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-ok/40 bg-ok/10 p-4 text-sm text-ok">
        <p>{t.suggestThanks}</p>
        <button onClick={onClose} aria-label={t.cancel} className="shrink-0">
          ✕
        </button>
      </div>
    );
  }

  return (
    <form
      className="mt-4 grid gap-3 rounded-2xl border border-border bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await sendFeedback(kind, message);
          setResult(res.error ? "failed" : "sent");
        });
      }}
    >
      <p className="font-medium">{t.suggestTitle}</p>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.key}
            type="button"
            onClick={() => setKind(k.key)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              kind === k.key
                ? "border-brand bg-brand-soft text-brand"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {t[k.label]}
          </button>
        ))}
      </div>
      <textarea
        required
        rows={4}
        maxLength={2000}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t.suggestPlaceholder}
        className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand"
      />
      {result === "failed" && <p className="text-sm text-bad">{t.suggestFailed}</p>}
      <div className="flex gap-3">
        <button
          disabled={pending || !message.trim()}
          className="flex-1 rounded-xl bg-brand px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {t.suggestSend}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-border px-4 py-3 text-muted transition hover:text-foreground"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
