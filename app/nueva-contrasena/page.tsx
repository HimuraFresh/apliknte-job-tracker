"use client";

import { useActionState, useState } from "react";
import { updatePassword } from "@/app/entrar/actions";
import { useLang } from "@/lib/lang";
import PasswordField from "@/components/PasswordField";
import { passwordOk } from "@/lib/password";

// Se llega aqui desde el enlace del correo, ya con sesion iniciada por /auth/callback.
export default function NuevaContrasenaPage() {
  const { t } = useLang();
  const [state, action, pending] = useActionState(updatePassword, {});
  const [password, setPassword] = useState("");

  return (
    <main className="flex-1 grid place-items-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{t.newPassword}</h1>

        <form action={action} className="mt-6 grid gap-3">
          <PasswordField
            value={password}
            onChange={setPassword}
            checklist
            autoComplete="new-password"
          />
          <button
            disabled={pending || !passwordOk(password)}
            className="rounded-xl bg-brand px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {t.savePassword}
          </button>
        </form>

        {state.error && <p className="mt-3 text-sm text-bad">{t.authError(state.error)}</p>}
      </div>
    </main>
  );
}
