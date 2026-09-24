import { cookies } from "next/headers";

// Titulo de la pestaña, en el idioma elegido: "Candidaturas · Apliknte". Las pantallas que
// no lo usan se quedan con "Apliknte" a secas, el del layout.
export async function title(es: string, en: string) {
  const locale = (await cookies()).get("locale")?.value;
  return { title: `${locale === "en" ? en : es} · Apliknte` };
}
