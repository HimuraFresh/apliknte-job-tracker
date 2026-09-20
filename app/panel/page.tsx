import { supabaseServer } from "@/lib/supabase/server";
import Panel, { type Application } from "@/components/Panel";

export default async function PanelPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("applications")
    .select("*")
    .order("applied_on", { ascending: false });

  return <Panel rows={(data ?? []) as Application[]} />;
}
