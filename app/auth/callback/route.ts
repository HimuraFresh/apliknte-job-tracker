import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Aqui aterrizan los enlaces de los correos de Supabase (confirmar cuenta,
// cambiar contrasena): se canjea el codigo del enlace por una sesion.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/panel";
  // Solo rutas internas: un enlace manipulado no puede mandarte a otra web.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/panel";

  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
  }

  return NextResponse.redirect(new URL("/entrar?error=link", url.origin));
}
