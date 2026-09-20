"use client";

import { useActionState, useState } from "react";
import { signIn, signUp } from "./actions";
import { useLang, setLocale } from "@/lib/lang";

export default function EntrarPage() {
  const { t, locale } = useLang();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [state, action, pending] = useActionState(mode === "in" ? signIn : signUp, {});

  const tab = (active: boolean) =>
    `flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
      active ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
    }`;

  return (
    <main className="flex-1 grid place-items-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{t.appName}</h1>
            <p className="mt-1 text-muted">{t.tagline}</p>
          </div>
          <div className="flex overflow-hidden rounded-lg border border-border text-xs">
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => l !== locale && setLocale(l)}
                className={`px-2.5 py-1.5 transition ${
                  l === locale ? "bg-brand text-white" : "text-muted hover:text-foreground"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1 rounded-xl bg-brand-soft/60 p-1">
          <button onClick={() => setMode("in")} className={tab(mode === "in")}>
            {t.signIn}
          </button>
          <button onClick={() => setMode("up")} className={tab(mode === "up")}>
            {t.signUp}
          </button>
        </div>

        <form action={action} className="mt-4 grid gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder={t.email}
            autoComplete="email"
            className="rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand"
          />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder={t.password}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            className="rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand"
          />
          {mode === "up" && <p className="-mt-1 text-xs text-muted">{t.passwordHint}</p>}
          <button
            disabled={pending}
            className="rounded-xl bg-brand px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {mode === "in" ? t.signIn : t.signUp}
          </button>
        </form>

        {state.error && <p className="mt-3 text-sm text-bad">{state.error}</p>}
        {state.message === "checkEmail" && (
          <p className="mt-3 rounded-xl bg-ok/10 p-3 text-sm text-ok">{t.checkEmail}</p>
        )}
      </div>
    </main>
  );
}
