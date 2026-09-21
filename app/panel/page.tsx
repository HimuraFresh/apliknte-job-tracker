import { supabaseServer } from "@/lib/supabase/server";
import Panel, { type Application, type Cv } from "@/components/Panel";

export default async function PanelPage() {
  const supabase = await supabaseServer();
  const [{ data: rows }, { data: cvs }, { data: auth }] = await Promise.all([
    supabase.from("applications").select("*").order("applied_on", { ascending: false }),
    supabase.from("cv_versions").select("id, label").order("label"),
    supabase.auth.getUser(),
  ]);

  return (
    <Panel
      rows={(rows ?? []) as Application[]}
      cvs={(cvs ?? []) as Cv[]}
      userId={auth.user?.id ?? ""}
    />
  );
}
