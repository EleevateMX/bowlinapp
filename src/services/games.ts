import { supabase } from "@/lib/supabase";
import { demoCreateGame, demoListGames } from "@/lib/demo-store";
import { scoreGame, totalScore } from "@/lib/scoring";
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
  /** Tiros capturados frame por frame (opcional). Si viene, el score se deriva. */
  throws?: number[];
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
  // Modo demo: persiste en localStorage
  if (!supabase) {
    return demoCreateGame({
      centerName: input.centerName ?? null,
      gameType: input.gameType,
      scoringMode: input.scoringMode,
      players: input.players.map((p) => ({
        name: p.name,
        isSelf: !!p.isSelf,
        finalScore:
          p.throws && p.throws.length > 0 ? totalScore(p.throws) : p.score,
        throws: p.throws,
      })),
    });
  }

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
    // Con captura frame por frame el score se calcula, no se confía en el input
    const finalScore =
      p.throws && p.throws.length > 0 ? totalScore(p.throws) : p.score;
    rows.push({
      game_id: game.id,
      player_id: playerId,
      final_score: finalScore,
      turn_order: order++,
    });
  }

  const { data: insertedPlayers, error: playersError } = await supabase
    .from("game_players")
    .insert(rows)
    .select("id, turn_order");
  if (playersError) throw playersError;

  // Persiste frames + tiros para los jugadores capturados frame por frame
  const framePlayers = input.players
    .map((p, idx) => ({ p, turnOrder: idx + 1 }))
    .filter((x) => x.p.throws && x.p.throws.length > 0);

  for (const { p, turnOrder } of framePlayers) {
    const gpId = insertedPlayers?.find((r) => r.turn_order === turnOrder)?.id;
    if (!gpId) continue;

    const frames = scoreGame(p.throws!);
    const { data: frameRows, error: frameError } = await supabase
      .from("frames")
      .insert(
        frames.map((f) => ({
          game_player_id: gpId,
          frame_number: f.frameNumber,
          is_strike: f.isStrike,
          is_spare: f.isSpare,
          cumulative_score: f.cumulativeScore,
        })),
      )
      .select("id, frame_number");
    if (frameError) throw frameError;

    const throwRows: {
      frame_id: string;
      throw_number: number;
      pins_knocked: number;
    }[] = [];
    for (const f of frames) {
      const frameId = frameRows?.find(
        (fr) => fr.frame_number === f.frameNumber,
      )?.id;
      if (!frameId) continue;
      f.throws.forEach((pins, i) => {
        throwRows.push({
          frame_id: frameId,
          throw_number: i + 1,
          pins_knocked: pins,
        });
      });
    }
    if (throwRows.length > 0) {
      const { error: throwError } = await supabase
        .from("throws")
        .insert(throwRows);
      if (throwError) throw throwError;
    }
  }

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
    // Modo demo: lee del store local
    return demoListGames(limit).map((g) => ({
      id: g.id,
      centerName: g.centerName,
      playedAt: g.playedAt,
      gameType: g.gameType,
      scoringMode: g.scoringMode,
      myScore: g.players.find((p) => p.isSelf)?.finalScore ?? 0,
      players: g.players.length,
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
