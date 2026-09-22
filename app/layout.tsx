import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { LangProvider } from "@/lib/lang";
import type { Locale } from "@/lib/dict";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const description = "Tus candidaturas de empleo, ordenadas";

export const metadata: Metadata = {
  // Base para que las imagenes de vista previa lleven la direccion completa.
  metadataBase: new URL("https://apliknte.vercel.app"),
  title: "Apliknte",
  description,
  openGraph: { title: "Apliknte", description, siteName: "Apliknte", locale: "es_ES", type: "website" },
};

// Barra del navegador del movil del color del fondo, segun el tema elegido.
export async function generateViewport(): Promise<Viewport> {
  const dark = (await cookies()).get("theme")?.value === "dark";
  return { themeColor: dark ? "#0b0d12" : "#ffffff" };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const store = await cookies();
  const locale = (store.get("locale")?.value ?? "es") as Locale;
  // El tema se decide en el servidor: sin parpadeo en blanco al cargar en modo oscuro.
  const theme = store.get("theme")?.value === "dark" ? "dark" : "light";

  return (
    <html lang={locale} data-theme={theme} className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LangProvider locale={locale}>{children}</LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
