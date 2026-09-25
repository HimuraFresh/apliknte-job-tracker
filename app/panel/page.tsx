import { supabaseServer } from "@/lib/supabase/server";
import { title } from "@/lib/title";
import Panel, { type Application, type Cv } from "@/components/Panel";
import { AVATARS, avatarFor } from "@/components/Avatar";

export const generateMetadata = () => title("Candidaturas", "Applications");

export default async function PanelPage() {
  const supabase = await supabaseServer();
  const [{ data: rows, error }, { data: cvs }, { data: auth }] = await Promise.all([
    supabase.from("applications").select("*").order("applied_on", { ascending: false }),
    supabase.from("cv_versions").select("id, label").order("label"),
    supabase.auth.getUser(),
  ]);

  // Si la consulta falla (sesion a medio renovar, red...), no enseñar "0 candidaturas":
  // parece que se han borrado. Mejor avisar y que recargue.
  if (error) {
    console.error("panel:", error.message);
    return (
      <main className="grid flex-1 place-items-center p-6 text-center">
        <p className="text-muted">
          No hemos podido cargar tus candidaturas.{" "}
          <a href="/panel" className="text-brand underline">
            Vuelve a intentarlo
          </a>
          .
        </p>
      </main>
    );
  }

  // El avatar vive en la cuenta, junto al idioma. Quien no ha elegido tiene uno igual,
  // siempre el mismo, sacado de su correo.
  const elegido = auth.user?.user_metadata?.avatar;
  const avatar =
    Number.isInteger(elegido) && elegido >= 0 && elegido < AVATARS
      ? (elegido as number)
      : avatarFor(auth.user?.email ?? "");

  return (
    <Panel
      rows={(rows ?? []) as Application[]}
      cvs={(cvs ?? []) as Cv[]}
      userId={auth.user?.id ?? ""}
      email={auth.user?.email ?? ""}
      avatar={avatar}
    />
  );
}
