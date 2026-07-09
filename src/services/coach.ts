import { supabase } from "@/lib/supabase";
import { generateCoaching, weeklySummary, type CoachTip } from "@/lib/coach";
import { getAdvancedStats, getStatsSummary } from "./stats";

export interface Coaching {
  tips: CoachTip[];
  summary: string;
  /** De dónde salió el plan: IA (Edge Function) o motor de reglas local */
  source: "ai" | "rules";
}

/**
 * Genera el plan de coaching. En modo real intenta la Edge Function `coach`
 * (IA); si no está desplegada o falla, cae al motor de reglas local, que
 * también es el que se usa en modo demo.
 */
export async function getCoaching(
  playerId: string | null,
): Promise<Coaching> {
  const [summary, advanced] = await Promise.all([
    getStatsSummary(playerId),
    getAdvancedStats(playerId),
  ]);

  const fallback: Coaching = {
    tips: generateCoaching(summary, advanced),
    summary: weeklySummary(summary),
    source: "rules",
  };

  if (!supabase || !playerId || summary.totalGames === 0) return fallback;

  try {
    const { data, error } = await supabase.functions.invoke("coach", {
      body: { summary, advanced },
    });
    const tips = (data as { tips?: CoachTip[] } | null)?.tips;
    if (error || !tips || tips.length === 0) return fallback;
    return {
      tips,
      summary:
        (data as { summary?: string }).summary ?? fallback.summary,
      source: "ai",
    };
  } catch {
    return fallback;
  }
}
