"use client";

import { useLang } from "@/lib/lang";

// Tres cuadros encima del formulario de entrar: quien llega por primera vez ve un
// formulario y poco mas, asi que aqui se asoma lo que hace la app. Son dibujos, no
// capturas: a este tamano una captura se ve a barro. Entran una vez al cargar y se
// quedan quietos; el bucle cansa y esta app va de lo contrario.
export default function Vistazo() {
  const { t } = useLang();

  const caja = "grid gap-2 rounded-xl border border-border bg-surface p-2.5 motion-safe:animate-[vistazo_.5s_ease-out_backwards]";

  return (
    <div aria-hidden="true" className="mb-5 grid grid-cols-3 gap-2 text-center">
      <div className={caja} style={{ animationDelay: "60ms" }}>
        <div className="grid gap-1">
          <span className="block h-1.5 w-full rounded-full bg-brand/30" />
          <span className="block h-1.5 w-4/5 rounded-full bg-brand/20" />
          <span className="block h-1.5 w-full rounded-full bg-brand/30" />
        </div>
        <span className="text-[11px] leading-tight text-muted">{t.peekList}</span>
      </div>

      <div className={caja} style={{ animationDelay: "150ms" }}>
        <div className="grid place-items-center py-0.5">
          <span className="rounded-full bg-warn/15 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-warn">
            {t.peekDueChip}
          </span>
        </div>
        <span className="text-[11px] leading-tight text-muted">{t.peekDue}</span>
      </div>

      <div className={caja} style={{ animationDelay: "240ms" }}>
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-border">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="block h-2 bg-muted/15" />
          ))}
        </div>
        <span className="text-[11px] leading-tight text-muted">{t.peekImport}</span>
      </div>
    </div>
  );
}
