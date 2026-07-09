import { supabase } from "@/lib/supabase";
import { mockStats, mockScoreHistory } from "@/lib/mock-data";
import { scoreTrend } from "@/lib/scoring";
import type { StatsSummary } from "@/types";

export interface ScorePoint {
  date: string;
  score: number;
}

/** Resumen de estadísticas de un jugador (usa la función SQL + tendencia) */
export async function getStatsSummary(
  playerId: string | null,
): Promise<StatsSummary> {
  if (!supabase || !playerId) return mockStats;

  const { data, error } = await supabase.rpc("player_stats_summary", {
    p_player_id: playerId,
  });
  if (error || !data || data.length === 0) {
    return {
      averageScore: 0,
      bestScore: 0,
      totalGames: 0,
      strikeRate: 0,
      spareRate: 0,
      openFrameRate: 0,
      trend: "flat",
    };
  }

  const r = data[0];
  const history = await getScoreHistory(playerId, 20);

  return {
    averageScore: Number(r.average_score ?? 0),
    bestScore: Number(r.best_score ?? 0),
    totalGames: Number(r.games_count ?? 0),
    strikeRate: Number(r.strike_rate ?? 0),
    spareRate: Number(r.spare_rate ?? 0),
    openFrameRate: Number(r.open_frame_rate ?? 0),
    trend: scoreTrend(history.map((h) => h.score)),
  };
}

/** Historial de scores para la gráfica (orden cronológico ascendente) */
export async function getScoreHistory(
  playerId: string | null,
  limit = 10,
): Promise<ScorePoint[]> {
  if (!supabase || !playerId) return mockScoreHistory;

  const { data, error } = await supabase.rpc("player_score_history", {
    p_player_id: playerId,
    p_limit: limit,
  });
  if (error || !data) return [];

  // La función devuelve descendente; la gráfica necesita ascendente
  return data
    .map((r) => ({ date: r.played_at, score: Number(r.final_score) }))
    .reverse();
}
