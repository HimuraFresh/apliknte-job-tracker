"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

type State = { error?: string; message?: string };

// Se devuelve el codigo del error, no el texto en ingles de Supabase: la pantalla lo
// traduce (dict.authError). El texto original queda en los logs de Vercel.
function fail(error: AuthError): State {
  console.error("auth:", error.code, error.message);
  return { error: error.code ?? "unknown" };
}

export async function signIn(_prev: State, formData: FormData): Promise<State> {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) return fail(error);
  redirect("/panel");
}

export async function signUp(_prev: State, formData: FormData): Promise<State> {
  const supabase = await supabaseServer();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    // El enlace del correo de confirmacion vuelve aqui y deja la sesion iniciada. El idioma
    // se guarda en la cuenta: las plantillas de correo de Supabase eligen con el.
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { locale: (await cookies()).get("locale")?.value === "en" ? "en" : "es" },
    },
  });
  if (error) return fail(error);
  // Con "Confirm email" activado, Supabase no da error si el correo ya existe (para no
  // revelar quien esta registrado): devuelve un usuario sin identidades y no envia nada.
  if (data.user?.identities?.length === 0) return { error: "user_already_exists" };
  // Si Supabase pide confirmar el correo, no hay sesion todavia.
  if (!data.session) return { message: "checkEmail" };
  redirect("/panel");
}

export async function requestPasswordReset(_prev: State, formData: FormData): Promise<State> {
  const supabase = await supabaseServer();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(String(formData.get("email")), {
    redirectTo: `${origin}/auth/callback?next=/nueva-contrasena`,
  });
  if (error) return fail(error);
  // Mismo mensaje exista o no la cuenta: asi no se puede averiguar quien esta registrado.
  return { message: "resetSent" };
}

export async function updatePassword(_prev: State, formData: FormData): Promise<State> {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.updateUser({
    password: String(formData.get("password")),
  });
  if (error) return fail(error);
  redirect("/panel");
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/entrar");
}
