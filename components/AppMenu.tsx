"use client";

import { useId, useState, useTransition } from "react";
import { useLang, setLocale, setTheme } from "@/lib/lang";
import { signOut } from "@/app/entrar/actions";
import { deleteAccount } from "@/app/panel/actions";
import Flag from "@/components/Flag";
import Install from "@/components/Install";

const LANGS = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
] as const;

// Menu de la cabecera: idioma, modo oscuro, sugerencias y cerrar sesion.
export default function AppMenu({
  onSuggest,
  onCvs,
  onExport,
  onImport,
}: {
  onSuggest: () => void;
  onCvs: () => void;
  onExport: () => void;
  onImport: () => void;
}) {
  const { t, locale } = useLang();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [killing, setKilling] = useState(false);
  const [pending, start] = useTransition();
  const menuId = useId();

  const toggle = () => {
    // El tema real vive en <html>: se lee al abrir, asi el interruptor siempre acierta.
    if (!open) setDark(document.documentElement.dataset.theme === "dark");
    setOpen(!open);
  };

  const item =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-brand-soft";

  return (
    <div className="relative" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <button
        type="button"
        onClick={toggle}
        aria-label={t.menu}
        aria-expanded={open}
        aria-controls={menuId}
        className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface text-foreground transition hover:border-brand"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <>
          {/* Capta el toque fuera del menu para cerrarlo */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            id={menuId}
            className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-border bg-surface p-2 shadow-xl"
          >
            <p className="px-3 pb-1 pt-2 text-xs text-muted">{t.language}</p>
            <div className="grid grid-cols-2 gap-1 px-1 pb-2">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  aria-pressed={l.code === locale}
                  onClick={() => l.code !== locale && setLocale(l.code)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                    l.code === locale
                      ? "bg-brand-soft font-medium text-brand"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Flag code={l.code} />
                  {l.label}
                </button>
              ))}
            </div>

            {/* Dice el modo al que vas a cambiar: en oscuro pone "Modo claro" con un sol. */}
            <button
              type="button"
              onClick={() => {
                setTheme(dark ? "light" : "dark");
                setDark(!dark);
              }}
              className={item}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {dark ? (
                  <>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </>
                ) : (
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                )}
              </svg>
              {dark ? t.lightMode : t.darkMode}
            </button>

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

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onImport();
              }}
              className={item}
            >
              {t.importCsv}
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onExport();
              }}
              className={item}
            >
              {t.exportCsv}
            </button>

            <a href="/ayuda" className={item}>
              {t.help}
            </a>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSuggest();
              }}
              className={item}
            >
              {t.suggestions}
            </button>

            <Install className={item} />

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
