"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type State = { error?: string; message?: string };

export async function signIn(_prev: State, formData: FormData): Promise<State> {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) return { error: error.message };
  redirect("/panel");
}

export async function signUp(_prev: State, formData: FormData): Promise<State> {
  const supabase = await supabaseServer();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    // El enlace del correo de confirmacion vuelve aqui y deja la sesion iniciada.
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: error.message };
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
  if (error) return { error: error.message };
  // Mismo mensaje exista o no la cuenta: asi no se puede averiguar quien esta registrado.
  return { message: "resetSent" };
}

export async function updatePassword(_prev: State, formData: FormData): Promise<State> {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.updateUser({
    password: String(formData.get("password")),
  });
  if (error) return { error: error.message };
  redirect("/panel");
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/entrar");
}
