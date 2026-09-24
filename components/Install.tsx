"use client";

import { useState } from "react";
import { useLang } from "@/lib/lang";

type InstallEvent = Event & { prompt: () => void };

// Chrome avisa de que se puede instalar nada mas cargar la pagina, mucho antes de que
// abras el menu: se guarda aqui para tenerlo cuando haga falta.
let deferred: InstallEvent | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
  });
}

// Como se instala aqui, si es que se puede. Se mira al montar, ya en el navegador: este
// menu no existe hasta que lo abres. Safari viejo no entiende display-mode pero marca
// navigator.standalone.
function detect(): "prompt" | "ios" | null {
  if (typeof window === "undefined") return null;
  const nav = navigator as Navigator & { standalone?: boolean };
  if (window.matchMedia("(display-mode: standalone)").matches || nav.standalone) return null;
  return deferred ? "prompt" : /iphone|ipad|ipod/i.test(nav.userAgent) ? "ios" : null;
}

// Instalar la app en el movil. Android abre su propio dialogo; Safari no ofrece ninguno,
// asi que alli solo se explica el camino. Si ya esta instalada no aparece nada.
export default function Install({ className }: { className: string }) {
  const { t } = useLang();
  const [how, setHow] = useState(detect);
  const [showHow, setShowHow] = useState(false);

  if (!how) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (how === "ios") return setShowHow(!showHow);
          deferred?.prompt();
          deferred = null;
          setHow(null);
        }}
        className={className}
      >
        {t.install}
      </button>
      {showHow && (
        <ol className="grid gap-2 px-3 pb-3 pt-1 text-xs text-muted">
          <li className="flex items-center gap-1.5">
            1 · {t.installIos1}
            {/* Dibujado y no descrito: el boton esta arriba o abajo segun el navegador,
                pero el icono es el mismo en todos. */}
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v12M8 7l4-4 4 4" />
              <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
            </svg>
          </li>
          <li>2 · {t.installIos2}</li>
          <li>3 · {t.installIos3}</li>
        </ol>
      )}
    </>
  );
}
