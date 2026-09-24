"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { toEuros } from "@/lib/money";
import { plusDays, today } from "@/lib/dates";

type Supabase = Awaited<ReturnType<typeof supabaseServer>>;

const str = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
};

// El navegador ya subio el PDF a cvs/<usuario>/...; aqui se registra con su tipo.
// Si el tipo ya existia se le cambia el archivo y se borra el viejo del almacen.
async function saveCv(supabase: Supabase, userId: string, label: string, path: string) {
  // La ruta la manda el navegador: solo se acepta dentro de la carpeta del usuario.
  if (!path.startsWith(`${userId}/`)) return null;

  const { data: old } = await supabase
    .from("cv_versions")
    .select("id, file_path")
    .eq("label", label)
    .maybeSingle();

  if (old) {
    await supabase.from("cv_versions").update({ file_path: path }).eq("id", old.id);
    if (old.file_path && old.file_path !== path) {
      await supabase.storage.from("cvs").remove([old.file_path]);
    }
    return old.id as string;
  }

  const { data } = await supabase
    .from("cv_versions")
    .insert({ user_id: userId, label, file_path: path })
    .select("id")
    .single();
  return (data?.id as string | undefined) ?? null;
}

// Mismos campos para crear y para editar.
async function readForm(supabase: Supabase, userId: string, formData: FormData) {
  const company = str(formData.get("company"));
  const role = str(formData.get("role"));
  if (!company || !role) return null;

  const appliedOn = str(formData.get("applied_on")) ?? today();
  const newPath = str(formData.get("cv_new_path"));
  const newLabel = str(formData.get("cv_new_label"));

  return {
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
    cv_version_id:
      newPath && newLabel
        ? await saveCv(supabase, userId, newLabel, newPath)
        : str(formData.get("cv_version_id")),
    notes: str(formData.get("notes"))?.slice(0, 2000) ?? null,
  };
}

async function currentUser() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function addApplication(formData: FormData) {
  const { supabase, user } = await currentUser();
  if (!user) return { error: "auth" };

  const fields = await readForm(supabase, user.id, formData);
  if (!fields) return { error: "required" };

  const { error } = await supabase
    .from("applications")
    .insert({ user_id: user.id, ...fields });

  if (error) return { error: error.message };
  revalidatePath("/panel");
  return {};
}

export async function updateApplication(id: string, formData: FormData) {
  const { supabase, user } = await currentUser();
  if (!user) return { error: "auth" };

  const fields = await readForm(supabase, user.id, formData);
  if (!fields) return { error: "required" };
  return patch(id, fields);
}

export async function deleteApplication(id: string) {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("applications").delete().eq("id", id);
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

// Aplazar el aviso de seguimiento o quitarlo: sin fecha no volvemos a avisar. Hay empresas
// a las que no hay a quien escribir y el recordatorio solo molesta.
export async function setFollowUp(id: string, follow_up_on: string | null) {
  return patch(id, { follow_up_on });
}

// "Mis CVs" > Cambiar: el navegador ya subio el PDF nuevo; se apunta el CV a el y se borra
// el viejo. RLS impide tocar CVs de otro usuario (la consulta no los devuelve).
export async function replaceCv(id: string, path: string) {
  const { supabase, user } = await currentUser();
  if (!user) return { error: "auth" };
  if (!path.startsWith(`${user.id}/`)) return { error: "path" };

  const { data: old } = await supabase
    .from("cv_versions")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();
  if (!old) return { error: "not_found" };

  const { error } = await supabase.from("cv_versions").update({ file_path: path }).eq("id", id);
  if (error) return { error: error.message };
  if (old.file_path && old.file_path !== path) {
    await supabase.storage.from("cvs").remove([old.file_path]);
  }
  revalidatePath("/panel");
  return {};
}

const FEEDBACK_KINDS = ["error", "idea", "duda"];

export async function sendFeedback(kind: string, message: string) {
  const { supabase, user } = await currentUser();
  if (!user) return { error: "auth" };

  const text = message.trim().slice(0, 2000);
  if (!text || !FEEDBACK_KINDS.includes(kind)) return { error: "required" };

  const { error } = await supabase
    .from("feedback")
    .insert({ user_id: user.id, email: user.email, kind, message: text });
  if (error) return { error: error.message };
  return {};
}

// Borrar la cuenta entera. Los PDF van primero: no se borran en cascada con el usuario
// y se quedarian ocupando el almacen para siempre. Lo demas (candidaturas, CVs) cae solo
// al borrar el usuario. No hay vuelta atras.
export async function deleteAccount() {
  const { supabase, user } = await currentUser();
  if (!user) return { error: "auth" };

  const { data: files } = await supabase.storage.from("cvs").list(user.id);
  if (files?.length) {
    await supabase.storage.from("cvs").remove(files.map((f) => `${user.id}/${f.name}`));
  }

  const { error } = await supabase.rpc("delete_account");
  if (error) return { error: error.message };

  // La sesion ya no vale para nada, pero hay que quitar la cookie del navegador.
  await supabase.auth.signOut();
  redirect("/entrar");
}
