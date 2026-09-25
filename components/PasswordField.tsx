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

// Contrasena con boton "Mostrar". Al elegir una nueva (crear cuenta o recuperarla) salen
// los requisitos marcandose mientras escribes y una segunda casilla para repetirla: con
// una sola, un dedo torpe te deja fuera de tu propia cuenta sin que nadie se entere. Al
// entrar no sale ninguna de las dos cosas, que ahi la contrasena ya la tienes.
export default function PasswordField({
  value,
  onChange,
  confirm = "",
  onConfirm,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  confirm?: string;
  onConfirm?: (value: string) => void;
  autoComplete: "current-password" | "new-password";
}) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const rules = passwordRules(value);
  // Los requisitos y la casilla de repetir van juntos: hacen falta en los mismos dos sitios.
  const isNew = autoComplete === "new-password";
  const match = confirm !== "" && confirm === value;

  const box = "w-full rounded-xl border border-border bg-surface py-3 pl-4 outline-none focus:border-brand";
  // Sin esto el movil pone mayusculas o autocorrige la contrasena al verla.
  const plain = { autoCapitalize: "none", autoCorrect: "off", spellCheck: false } as const;

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
          {...plain}
          className={`${box} pr-24`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-brand transition hover:bg-brand-soft"
        >
          {visible ? t.hidePassword : t.showPassword}
        </button>
      </div>

      {isNew && (
        <>
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

          <input
            name="password2"
            type={visible ? "text" : "password"}
            required
            value={confirm}
            onChange={(e) => onConfirm?.(e.target.value)}
            placeholder={t.repeatPassword}
            autoComplete="new-password"
            {...plain}
            className={`${box} pr-4`}
          />
          <p className={`text-xs ${match ? "text-ok" : "text-muted"}`}>
            {match ? "✓" : "○"} {t.ruleMatch}
          </p>
        </>
      )}
    </div>
  );
}
