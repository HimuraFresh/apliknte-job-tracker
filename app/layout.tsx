import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";
import { LangProvider } from "@/lib/lang";
import type { Locale } from "@/lib/dict";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "apliknte",
  description: "Tus candidaturas de empleo, ordenadas",
};

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
