"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/entrar/actions";
import { useLang } from "@/lib/lang";

// Se llega aqui desde el enlace del correo, ya con sesion iniciada por /auth/callback.
export default function NuevaContrasenaPage() {
  const { t } = useLang();
  const [state, action, pending] = useActionState(updatePassword, {});

  return (
    <main className="flex-1 grid place-items-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{t.newPassword}</h1>
        <p className="mt-1 text-sm text-muted">{t.passwordHint}</p>

        <form action={action} className="mt-6 grid gap-3">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder={t.password}
            className="rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand"
          />
          <button
            disabled={pending}
            className="rounded-xl bg-brand px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {t.savePassword}
          </button>
        </form>

        {state.error && <p className="mt-3 text-sm text-bad">{state.error}</p>}
      </div>
    </main>
  );
}
