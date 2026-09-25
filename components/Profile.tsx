"use client";

import { useId, useState, useTransition } from "react";
import { useLang } from "@/lib/lang";
import { signOut } from "@/app/entrar/actions";
import { setAvatar, deleteAccount } from "@/app/panel/actions";
import Avatar, { AVATARS } from "@/components/Avatar";

// El circulo de la cabecera: tu cuenta. Quien eres (con dos cuentas abiertas no habia
// forma de saberlo sin cerrar sesion), tu dibujo, tus CV, y las dos puertas de salida.
// Los ajustes de la aplicacion siguen en el menu de al lado.
export default function Profile({
  email,
  avatar,
  onCvs,
}: {
  email: string;
  avatar: number;
  onCvs: () => void;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(avatar);
  const [killing, setKilling] = useState(false);
  const [pending, start] = useTransition();
  const menuId = useId();

  // Se cambia a la vista y se guarda por detras; si fallara, al recargar vuelve el de antes.
  const choose = (n: number) => {
    setId(n);
    start(() => void setAvatar(n));
  };

  const item =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-brand-soft";

  return (
    <div className="relative" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={t.profile}
        aria-expanded={open}
        aria-controls={menuId}
        className="block h-11 w-11 overflow-hidden rounded-full ring-1 ring-border transition hover:ring-2 hover:ring-brand"
      >
        <Avatar id={id} className="h-full w-full" />
      </button>

      {open && (
        <>
          {/* Capta el toque fuera para cerrarlo */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            id={menuId}
            className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-border bg-surface p-2 shadow-xl"
          >
            <div className="px-3 pb-2 pt-1">
              <p className="text-xs text-muted">{t.signedInAs}</p>
              <p className="truncate text-sm font-medium" title={email}>
                {email}
              </p>
            </div>

            <p className="px-3 pb-1 text-xs text-muted">{t.chooseAvatar}</p>
            <div className="flex justify-between px-1 pb-1">
              {Array.from({ length: AVATARS }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => choose(n)}
                  aria-pressed={n === id}
                  aria-label={t.avatarNames[n]}
                  className={`tap block h-10 w-10 overflow-hidden rounded-full transition ${
                    n === id ? "ring-2 ring-brand" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Avatar id={n} className="h-full w-full" />
                </button>
              ))}
            </div>

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCvs();
              }}
              className={item}
            >
              {t.myCvs}
            </button>

            <div className="my-1 border-t border-border" />

            <form action={signOut}>
              <button className={`${item} text-bad hover:bg-bad/10`}>{t.signOut}</button>
            </form>

            {/* Apagado y sin color hasta que lo tocas: no es algo que se pulse sin querer. */}
            {killing ? (
              <div className="grid gap-2 rounded-xl bg-bad/5 p-3">
                <p className="text-sm text-bad">{t.deleteAccountWarning}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => start(() => void deleteAccount())}
                    className="rounded-lg bg-bad px-3 py-1.5 text-xs font-medium text-on-solid transition hover:opacity-90 disabled:opacity-50"
                  >
                    {t.deleteAccountConfirm}
                  </button>
                  <button
                    type="button"
                    onClick={() => setKilling(false)}
                    className="tap px-2 text-xs text-muted transition hover:text-foreground"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setKilling(true)}
                className={`${item} text-muted hover:bg-bad/10 hover:text-bad`}
              >
                {t.deleteAccount}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
