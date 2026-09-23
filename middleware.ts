import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresca la cookie de sesion en cada navegacion y protege las rutas privadas.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPrivate = ["/panel", "/nueva-contrasena", "/cv/"].some((p) => path.startsWith(p));
  if (!user && isPrivate) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }
  if (user && path === "/entrar") {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  // Sin guardar en el navegador: al reabrir la pestana, Chrome mostraba la copia vieja
  // del panel (con las candidaturas de entonces) en vez de pedirla otra vez.
  if (isPrivate) response.headers.set("Cache-Control", "no-store, must-revalidate");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
