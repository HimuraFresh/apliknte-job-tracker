"use client";

import { useId, useState, useTransition } from "react";
import { useLang } from "@/lib/lang";
import { setAvatar } from "@/app/panel/actions";
import Avatar, { AVATARS } from "@/components/Avatar";

// El circulo de la cabecera. Sirve para dos cosas: decir en que cuenta estas (con dos
// cuentas abiertas no habia forma de saberlo sin cerrar sesion) y cambiar el dibujo.
// Nada mas: los ajustes siguen en el menu, que es donde la gente ya los busca.
export default function Profile({ email, avatar }: { email: string; avatar: number }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(avatar);
  const [, start] = useTransition();
  const menuId = useId();

  // Se cambia a la vista y se guarda por detras; si fallara, al recargar vuelve el de antes.
  const choose = (n: number) => {
    setId(n);
    start(() => void setAvatar(n));
  };

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
            className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-border bg-surface p-3 shadow-xl"
          >
            <p className="text-xs text-muted">{t.signedInAs}</p>
            <p className="truncate text-sm font-medium" title={email}>
              {email}
            </p>

            <p className="mt-3 pb-1 text-xs text-muted">{t.chooseAvatar}</p>
            <div className="flex justify-between">
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
          </div>
        </>
      )}
    </div>
  );
}
