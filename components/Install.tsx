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
      {showHow && <p className="px-3 pb-2 text-xs text-muted">{t.installIos}</p>}
    </>
  );
}
