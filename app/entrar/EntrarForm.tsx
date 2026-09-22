"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, requestPasswordReset } from "./actions";
import { useLang, setLocale } from "@/lib/lang";
import Logo from "@/components/Logo";
import Flag from "@/components/Flag";
import PasswordField from "@/components/PasswordField";
import { passwordOk } from "@/lib/password";

export default function EntrarForm({ linkError }: { linkError: boolean }) {
  const { t, locale } = useLang();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  // Un useActionState por pestaña, cada uno con su accion fija. Con uno solo cambiando de
  // accion, React no se entera al volver a la primera: tras pasar por "Crear cuenta",
  // "Entrar" seguia registrando. De paso, cada pestaña guarda sus propios mensajes.
  const forms = {
    in: useActionState(signIn, {}),
    up: useActionState(signUp, {}),
    reset: useActionState(requestPasswordReset, {}),
  };
  const [state, action, pending] = forms[mode];
  const exists = ["user_already_exists", "email_exists"].includes(state.error ?? "");
  // Al crear cuenta no se envia nada hasta cumplir los requisitos: no gasta intentos ni correos.
  const blocked = mode === "up" && !passwordOk(password);

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
                aria-pressed={l === locale}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 transition ${
                  l === locale ? "bg-brand text-on-solid" : "text-muted hover:text-foreground"
                }`}
              >
                <Flag code={l} />
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.email}
            autoComplete="email"
            className={field}
          />
          {mode !== "reset" && (
            <PasswordField
              value={password}
              onChange={setPassword}
              checklist={mode === "up"}
              autoComplete={mode === "in" ? "current-password" : "new-password"}
            />
          )}
          <button
            disabled={pending || blocked}
            className="rounded-xl bg-brand px-4 py-3 font-medium text-on-solid transition hover:opacity-90 disabled:opacity-50"
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
        {exists ? (
          <div className="mt-3 grid gap-2 rounded-xl bg-bad/5 p-3 text-sm">
            <p className="text-bad">{t.emailExists}</p>
            <button
              type="button"
              onClick={() => setMode("reset")}
              className="w-fit rounded-lg bg-brand px-3 py-1.5 font-medium text-on-solid transition hover:opacity-90"
            >
              {t.recoverPassword}
            </button>
          </div>
        ) : (
          state.error && <p className="mt-3 text-sm text-bad">{t.authError(state.error)}</p>
        )}
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
