"use client";

import { useState } from "react";
import { useLang } from "@/lib/lang";
import { passwordRules, type PasswordRule } from "@/lib/password";

const RULES: { key: PasswordRule; label: "ruleLength" | "ruleUpper" | "ruleLower" | "ruleDigit" | "ruleSymbol" }[] = [
  { key: "length", label: "ruleLength" },
  { key: "upper", label: "ruleUpper" },
  { key: "lower", label: "ruleLower" },
  { key: "digit", label: "ruleDigit" },
  { key: "symbol", label: "ruleSymbol" },
];

// Contrasena con boton "Mostrar". Con checklist, los requisitos se marcan mientras
// escribes (al crear cuenta o cambiarla; al entrar no hace falta).
export default function PasswordField({
  value,
  onChange,
  checklist = false,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  checklist?: boolean;
  autoComplete: "current-password" | "new-password";
}) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const rules = passwordRules(value);

  return (
    <div className="grid gap-2">
      <div className="relative">
        <input
          name="password"
          type={visible ? "text" : "password"}
          required
          minLength={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.password}
          autoComplete={autoComplete}
          // Sin esto el movil pone mayusculas o autocorrige la contrasena al verla.
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-xl border border-border bg-surface py-3 pl-4 pr-24 outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-brand transition hover:bg-brand-soft"
        >
          {visible ? t.hidePassword : t.showPassword}
        </button>
      </div>

      {checklist && (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {RULES.map(({ key, label }) => (
            <li
              key={key}
              // el del simbolo es el mas largo: ocupa la fila entera para no partirse
              className={`${rules[key] ? "text-ok" : "text-muted"} ${key === "symbol" ? "col-span-2" : ""}`}
            >
              {rules[key] ? "✓" : "○"} {t[label]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
