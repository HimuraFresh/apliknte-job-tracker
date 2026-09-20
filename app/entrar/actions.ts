"use server";

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
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) return { error: error.message };
  // Si Supabase pide confirmar el correo, no hay sesion todavia.
  if (!data.session) return { message: "checkEmail" };
  redirect("/panel");
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/entrar");
}
