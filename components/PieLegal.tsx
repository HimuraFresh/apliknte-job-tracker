"use client";

import { usePathname } from "next/navigation";
import { useLang } from "@/lib/lang";

// Las letras pequenas de abajo. Mismo ancho que el panel para que en pantalla grande
// queden bajo el borde derecho de las fichas y no perdidas en la esquina de la ventana.
// En el movil, centradas y despegadas de la barra del iPhone.
// En la portada no sale: esa pagina ya lleva sus propios enlaces, y salian dos veces.
export default function PieLegal() {
  const { t } = useLang();
  if (usePathname() === "/inicio") return null;

  return (
    <footer className="mx-auto w-full max-w-3xl p-6 pb-12 text-center text-xs text-muted sm:px-8 sm:pb-6 sm:text-right lg:max-w-5xl">
      <a href="/privacidad" className="tap transition hover:text-foreground">
        {t.privacy}
      </a>
    </footer>
  );
}
