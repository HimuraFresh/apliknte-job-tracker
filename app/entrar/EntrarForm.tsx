"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, requestPasswordReset } from "./actions";
import { useLang, setLocale } from "@/lib/lang";
import Logo from "@/components/Logo";

const ACTIONS = { in: signIn, up: signUp, reset: requestPasswordReset };

export default function EntrarForm({ linkError }: { linkError: boolean }) {
  const { t, locale } = useLang();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [state, action, pending] = useActionState(ACTIONS[mode], {});

  const tab = (active: boolean) =>
    `flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
      active ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
    }`;
  const field =
    "rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand";

  return (
    <main className="flex-1 grid place-items-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl">
              <Logo />
            </h1>
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

        {mode === "reset" ? (
          <div>
            <h2 className="text-lg font-medium">{t.forgotPassword}</h2>
            <p className="mt-1 text-sm text-muted">{t.resetIntro}</p>
          </div>
        ) : (
          <div className="flex gap-1 rounded-xl bg-brand-soft/60 p-1">
            <button onClick={() => setMode("in")} className={tab(mode === "in")}>
              {t.signIn}
            </button>
            <button onClick={() => setMode("up")} className={tab(mode === "up")}>
              {t.signUp}
            </button>
          </div>
        )}

        <form action={action} className="mt-4 grid gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder={t.email}
            autoComplete="email"
            className={field}
          />
          {mode !== "reset" && (
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder={t.password}
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              className={field}
            />
          )}
          {mode === "up" && <p className="-mt-1 text-xs text-muted">{t.passwordHint}</p>}
          <button
            disabled={pending}
            className="rounded-xl bg-brand px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {mode === "in" ? t.signIn : mode === "up" ? t.signUp : t.sendResetLink}
          </button>
        </form>

        {mode === "in" && (
          <button
            onClick={() => setMode("reset")}
            className="mt-3 text-sm text-muted transition hover:text-foreground"
          >
            {t.forgotPassword}
          </button>
        )}
        {mode === "reset" && (
          <button
            onClick={() => setMode("in")}
            className="mt-3 text-sm text-muted transition hover:text-foreground"
          >
            ← {t.backToSignIn}
          </button>
        )}

        {linkError && !state.error && !state.message && (
          <p className="mt-3 text-sm text-bad">{t.linkError}</p>
        )}
        {state.error && <p className="mt-3 text-sm text-bad">{state.error}</p>}
        {state.message === "checkEmail" && (
          <p className="mt-3 rounded-xl bg-ok/10 p-3 text-sm text-ok">{t.checkEmail}</p>
        )}
        {state.message === "resetSent" && (
          <p className="mt-3 rounded-xl bg-ok/10 p-3 text-sm text-ok">{t.resetSent}</p>
        )}
      </div>
    </main>
  );
}
