// Las mismas reglas que Supabase (Authentication > Email > Password requirements),
// comprobadas antes de enviar: asi no se gastan intentos ni cupo de correos.
// Los simbolos son la lista exacta que devuelve Supabase en su error "weak_password".
export const SYMBOLS = "!@#$%^&*()_+-=[]{};'\\:\"|<>?,./`~";

export const passwordRules = (pw: string) => ({
  length: pw.length >= 8,
  lower: /[a-z]/.test(pw), // como Supabase: la ñ o las tildes no cuentan como minuscula
  upper: /[A-Z]/.test(pw),
  digit: /[0-9]/.test(pw),
  symbol: [...pw].some((c) => SYMBOLS.includes(c)),
});

export type PasswordRule = keyof ReturnType<typeof passwordRules>;

export const passwordOk = (pw: string) => Object.values(passwordRules(pw)).every(Boolean);
