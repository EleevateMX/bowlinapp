import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types";

/** Lee el perfil (tabla profiles) de un usuario y lo mapea al tipo del front */
export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, avatar_url, plan, created_at")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    avatarUrl: data.avatar_url ?? undefined,
    plan: data.plan,
    createdAt: data.created_at,
  };
}

/** Registro con email + contraseña. El trigger crea perfil y jugador "yo". */
export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<void> {
  if (!supabase) throw new Error("Supabase no está configurado");
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
}

/** Inicio de sesión con email + contraseña */
export async function signIn(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error("Supabase no está configurado");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}
