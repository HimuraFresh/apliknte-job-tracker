"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { toEuros } from "@/lib/money";
import { plusDays, today } from "@/lib/dates";

const str = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
};

export async function addApplication(formData: FormData) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth" };

  const company = str(formData.get("company"));
  const role = str(formData.get("role"));
  if (!company || !role) return { error: "required" };

  const appliedOn = str(formData.get("applied_on")) ?? today();

  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    company,
    role,
    source: str(formData.get("source")),
    url: str(formData.get("url")),
    work_mode: str(formData.get("work_mode")),
    salary_min: toEuros(formData.get("salary_min")),
    salary_max: toEuros(formData.get("salary_max")),
    applied_on: appliedOn,
    status: str(formData.get("status")) ?? "aplicado",
    // Si no la elige, se asigna sola a 15 dias de la fecha de aplicacion.
    follow_up_on: str(formData.get("follow_up_on")) ?? plusDays(appliedOn, 15),
  });

  if (error) return { error: error.message };
  revalidatePath("/panel");
  return {};
}

// RLS ya impide tocar filas de otro usuario, asi que no hace falta filtrar por user_id.
async function patch(id: string, fields: Record<string, unknown>) {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("applications").update(fields).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/panel");
  return {};
}

export async function setStatus(id: string, status: string) {
  return patch(id, { status });
}

export async function setFollowedUp(id: string, followed_up: boolean) {
  return patch(id, { followed_up });
}
