import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";
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

// Barra del navegador del movil en blanco, a juego con la app.
export const viewport: Viewport = { themeColor: "#ffffff" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = ((await cookies()).get("locale")?.value ?? "es") as Locale;

  return (
    <html lang={locale} className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LangProvider locale={locale}>{children}</LangProvider>
      </body>
    </html>
  );
}
