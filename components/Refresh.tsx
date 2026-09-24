"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang";

// Dentro de la app instalada no hay barra del navegador, y el iPhone tampoco da el gesto
// de deslizar para recargar: sin este boton no habria forma de pedir los datos de nuevo.
// En el navegador normal no aparece, que ahi ya esta el del propio navegador.
const standalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    !!(navigator as Navigator & { standalone?: boolean }).standalone);

export default function Refresh() {
  const { t } = useLang();
  const [show] = useState(standalone);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => start(() => router.refresh())}
      aria-label={t.refresh}
      className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-brand hover:text-foreground"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`h-5 w-5 ${pending ? "animate-spin" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-2.6-6.4" />
        <path d="M21 3v6h-6" />
      </svg>
    </button>
  );
}
