import { supabase } from "@/lib/supabase";
import type { Player } from "@/types";

interface PlayerRow {
  id: string;
  owner_id: string;
  name: string;
  avatar_url: string | null;
  is_owner: boolean;
}

function mapPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    avatarUrl: row.avatar_url ?? undefined,
    isOwner: row.is_owner,
  };
}

/** El jugador "yo" del usuario (creado por el trigger al registrarse) */
export async function getMyPlayer(userId: string): Promise<Player | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("players")
    .select("id, owner_id, name, avatar_url, is_owner")
    .eq("owner_id", userId)
    .eq("is_owner", true)
    .maybeSingle();
  return data ? mapPlayer(data) : null;
}

/** Lista todos los jugadores de la cuenta */
export async function listPlayers(userId: string): Promise<Player[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("players")
    .select("id, owner_id, name, avatar_url, is_owner")
    .eq("owner_id", userId)
    .order("is_owner", { ascending: false })
    .order("name");
  return (data ?? []).map(mapPlayer);
}

/** Busca un jugador por nombre (case-insensitive) o lo crea */
export async function getOrCreatePlayer(
  userId: string,
  name: string,
): Promise<Player> {
  if (!supabase) throw new Error("Supabase no está configurado");
  const clean = name.trim();
  const { data: found } = await supabase
    .from("players")
    .select("id, owner_id, name, avatar_url, is_owner")
    .eq("owner_id", userId)
    .ilike("name", clean)
    .limit(1)
    .maybeSingle();
  if (found) return mapPlayer(found);

  const { data, error } = await supabase
    .from("players")
    .insert({ owner_id: userId, name: clean })
    .select("id, owner_id, name, avatar_url, is_owner")
    .single();
  if (error) throw error;
  return mapPlayer(data);
}
