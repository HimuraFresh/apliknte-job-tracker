"use client";

import { useActionState, useState } from "react";
import { signIn, signUp } from "./actions";
import { useLang, setLocale } from "@/lib/lang";

export default function EntrarPage() {
  const { t, locale } = useLang();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [state, action, pending] = useActionState(mode === "in" ? signIn : signUp, {});

  return (
    <main className="flex-1 grid place-items-center p-6">
      <div className="w-full max-w-sm">
        <button
          onClick={() => setLocale(locale === "es" ? "en" : "es")}
          className="mb-6 text-sm text-muted hover:text-foreground transition"
        >
          {locale === "es" ? "English" : "Espanol"}
        </button>

        <h1 className="text-3xl font-semibold tracking-tight">{t.appName}</h1>
        <p className="mt-1 text-muted">{t.tagline}</p>

        <form action={action} className="mt-8 grid gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder={t.email}
            className="rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand"
          />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder={t.password}
            className="rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand"
          />
          <button
            disabled={pending}
            className="rounded-xl bg-brand px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {mode === "in" ? t.signIn : t.signUp}
          </button>
        </form>

        {state.error && <p className="mt-3 text-sm text-bad">{state.error}</p>}
        {state.message === "checkEmail" && (
          <p className="mt-3 text-sm text-ok">{t.checkEmail}</p>
        )}

        <button
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="mt-6 text-sm text-muted hover:text-foreground transition"
        >
          {mode === "in" ? `${t.noAccount} ${t.signUp}` : `${t.haveAccount} ${t.signIn}`}
        </button>
      </div>
    </main>
  );
}
