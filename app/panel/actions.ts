"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

const num = (v: FormDataEntryValue | null) => {
  const n = Number(v);
  return v && Number.isFinite(n) ? n : null;
};

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

  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    company,
    role,
    source: str(formData.get("source")),
    url: str(formData.get("url")),
    work_mode: str(formData.get("work_mode")),
    salary_min: num(formData.get("salary_min")),
    salary_max: num(formData.get("salary_max")),
    applied_on: str(formData.get("applied_on")) ?? new Date().toISOString().slice(0, 10),
    status: str(formData.get("status")) ?? "aplicado",
    follow_up_on: str(formData.get("follow_up_on")),
  });

  if (error) return { error: error.message };
  revalidatePath("/panel");
  return {};
}

export async function setStatus(id: string, status: string) {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("applications").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/panel");
  return {};
}
