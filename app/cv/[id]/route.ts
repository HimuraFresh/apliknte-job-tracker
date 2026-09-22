import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Abre un CV: comprueba que es del usuario (RLS) y redirige a un enlace que caduca en 60 s.
// Con ?download el navegador lo descarga con el nombre del tipo de CV en vez de abrirlo.
export async function GET(request: NextRequest, ctx: RouteContext<"/cv/[id]">) {
  const { id } = await ctx.params;
  const supabase = await supabaseServer();

  const { data: cv } = await supabase
    .from("cv_versions")
    .select("file_path, label")
    .eq("id", id)
    .maybeSingle();
  if (!cv?.file_path) return new NextResponse("CV no encontrado", { status: 404 });

  const download = request.nextUrl.searchParams.has("download")
    ? { download: `${cv.label.replace(/[\\/:*?"<>|]+/g, "-")}.pdf` }
    : undefined;
  const { data } = await supabase.storage.from("cvs").createSignedUrl(cv.file_path, 60, download);
  if (!data?.signedUrl) return new NextResponse("CV no encontrado", { status: 404 });

  return NextResponse.redirect(data.signedUrl);
}
