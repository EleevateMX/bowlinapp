import { supabase } from "@/lib/supabase";
import { mockGames } from "@/lib/mock-data";
import type { GameType, ScoringMode } from "@/types";
import { getMyPlayer, getOrCreatePlayer } from "./players";

export interface GameListItem {
  id: string;
  centerName: string | null;
  playedAt: string;
  gameType: GameType;
  scoringMode: ScoringMode;
  myScore: number;
  players: number;
}

export interface NewGamePlayerInput {
  name: string;
  score: number;
  isSelf?: boolean;
}

export interface NewGameInput {
  centerName?: string;
  gameType: GameType;
  scoringMode: ScoringMode;
  players: NewGamePlayerInput[];
}

/** Busca un boliche por nombre o lo crea; devuelve su id (o null si sin nombre) */
async function getOrCreateCenter(
  userId: string,
  name: string,
): Promise<string | null> {
  if (!supabase || !name.trim()) return null;
  const clean = name.trim();
  const { data: found } = await supabase
    .from("bowling_centers")
    .select("id")
    .eq("owner_id", userId)
    .ilike("name", clean)
    .limit(1)
    .maybeSingle();
  if (found) return found.id;

  const { data, error } = await supabase
    .from("bowling_centers")
    .insert({ owner_id: userId, name: clean })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** Crea una partida con sus jugadores. Devuelve el id de la partida. */
export async function createGame(
  userId: string,
  input: NewGameInput,
): Promise<string> {
  if (!supabase) throw new Error("Supabase no está configurado");

  const centerId = input.centerName
    ? await getOrCreateCenter(userId, input.centerName)
    : null;

  const { data: game, error } = await supabase
    .from("games")
    .insert({
      owner_id: userId,
      center_id: centerId,
      game_type: input.gameType,
      scoring_mode: input.scoringMode,
    })
    .select("id")
    .single();
  if (error) throw error;

  const self = await getMyPlayer(userId);
  const rows: {
    game_id: string;
    player_id: string;
    final_score: number;
    turn_order: number;
  }[] = [];

  let order = 1;
  for (const p of input.players) {
    const playerId =
      p.isSelf && self ? self.id : (await getOrCreatePlayer(userId, p.name)).id;
    rows.push({
      game_id: game.id,
      player_id: playerId,
      final_score: p.score,
      turn_order: order++,
    });
  }

  const { error: playersError } = await supabase
    .from("game_players")
    .insert(rows);
  if (playersError) throw playersError;

  return game.id;
}

interface GameRow {
  id: string;
  played_at: string;
  game_type: GameType;
  scoring_mode: ScoringMode;
  bowling_centers: { name: string } | null;
  game_players: { final_score: number; player_id: string }[];
}

/** Lista las partidas del usuario (más reciente primero) */
export async function listGames(
  userId: string,
  selfPlayerId: string | null,
  limit?: number,
): Promise<GameListItem[]> {
  if (!supabase) {
    // Modo demo sin credenciales
    const games = limit ? mockGames.slice(0, limit) : mockGames;
    return games.map((g) => ({
      id: g.id,
      centerName: g.centerName ?? null,
      playedAt: g.playedAt,
      gameType: g.gameType,
      scoringMode: g.scoringMode,
      myScore: g.myScore,
      players: g.players,
    }));
  }

  let query = supabase
    .from("games")
    .select(
      "id, played_at, game_type, scoring_mode, bowling_centers(name), game_players(final_score, player_id)",
    )
    .eq("owner_id", userId)
    .order("played_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as unknown as GameRow[];
  return rows.map((g) => {
    const mine =
      g.game_players.find((gp) => gp.player_id === selfPlayerId) ??
      g.game_players[0];
    return {
      id: g.id,
      centerName: g.bowling_centers?.name ?? null,
      playedAt: g.played_at,
      gameType: g.game_type,
      scoringMode: g.scoring_mode,
      myScore: mine?.final_score ?? 0,
      players: g.game_players.length,
    };
  });
}
