import type { AdvancedStats } from "@/services/stats";
import type { StatsSummary } from "@/types";

export type CoachCategory = "spares" | "strikes" | "consistency" | "general";

export interface CoachTip {
  id: string;
  title: string;
  body: string;
  category: CoachCategory;
  /** 1 (más alta) a 5 */
  priority: number;
  /** Puntos estimados que ganarías al promedio */
  expectedGain: number;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Motor de recomendaciones basado en reglas. Analiza las estadísticas del
 * jugador y devuelve un plan de mejora priorizado. En producción, la Edge
 * Function `coach` puede reemplazar esto con recomendaciones generadas por IA.
 */
export function generateCoaching(
  summary: StatsSummary,
  advanced: AdvancedStats,
): CoachTip[] {
  const tips: CoachTip[] = [];

  // Los spares suelen ser la mayor palanca de mejora
  if (summary.spareRate < 0.5) {
    tips.push({
      id: "spares-rate",
      title: "Los spares son tu mayor oportunidad",
      body: "Convertir spares es lo que más sube tu promedio. Dedica 10 min por sesión a practicar tus tiros de recuperación, empezando por el pin 10 y el pin 7.",
      category: "spares",
      priority: 1,
      expectedGain: clamp((0.65 - summary.spareRate) * 22, 4, 14),
    });
  }

  if (advanced.spareConversion !== null && advanced.spareConversion < 0.6) {
    tips.push({
      id: "spare-conversion",
      title: "Cierra los spares que ya dejas servidos",
      body: "Estás dejando spares convertibles en la mesa. Fija un punto de mira consistente para los pins de esquina y respeta tu rutina previa al tiro.",
      category: "spares",
      priority: 2,
      expectedGain: clamp((0.7 - advanced.spareConversion) * 18, 3, 12),
    });
  }

  if (summary.strikeRate < 0.28) {
    tips.push({
      id: "strikes",
      title: "Trabaja tu ataque a la bolsa",
      body: "Tu tasa de strikes tiene margen. Busca entrar a la bolsa (entre el pin 1 y 3 para diestros) con un ángulo constante; la velocidad pareja pega más carry.",
      category: "strikes",
      priority: 3,
      expectedGain: clamp((0.35 - summary.strikeRate) * 20, 3, 10),
    });
  }

  if (summary.openFrameRate > 0.35) {
    tips.push({
      id: "open-frames",
      title: "Reduce tus frames abiertos",
      body: "Demasiados frames abiertos frenan tu promedio. Prioriza cerrar cada frame: un spare seguro vale más que arriesgar un strike difícil.",
      category: "spares",
      priority: 2,
      expectedGain: clamp((summary.openFrameRate - 0.25) * 20, 3, 10),
    });
  }

  if (advanced.consistency < 0.5 && summary.totalGames >= 3) {
    tips.push({
      id: "consistency",
      title: "Busca regularidad, no solo tu mejor juego",
      body: "Tus scores varían bastante entre partidas. Trabaja una rutina previa idéntica en cada tiro y una velocidad constante; la regularidad sube el piso de tu promedio.",
      category: "consistency",
      priority: 3,
      expectedGain: clamp((0.6 - advanced.consistency) * 16, 3, 10),
    });
  }

  // Refuerzo positivo si hay una fortaleza clara
  if (summary.strikeRate >= 0.35) {
    tips.push({
      id: "strength-strikes",
      title: "Tu ataque es una fortaleza 💪",
      body: "Tienes buena tasa de strikes. Mantén tu rutina y enfócate ahora en no soltar frames abiertos para exprimir ese poder.",
      category: "general",
      priority: 4,
      expectedGain: 0,
    });
  }

  if (tips.length === 0) {
    tips.push({
      id: "keep-going",
      title: "Vas por buen camino 🎳",
      body: "Tus números están sólidos. Sigue registrando partidas para que el coach detecte patrones más finos y te dé objetivos concretos.",
      category: "general",
      priority: 4,
      expectedGain: 0,
    });
  }

  // Ordena por prioridad y, dentro de la misma, por mayor ganancia estimada
  return tips
    .sort((a, b) => a.priority - b.priority || b.expectedGain - a.expectedGain)
    .map((t) => ({ ...t, expectedGain: Math.round(t.expectedGain) }));
}

/** Resumen semanal corto a partir de las estadísticas */
export function weeklySummary(summary: StatsSummary): string {
  const trend =
    summary.trend === "up"
      ? "vas en ascenso 📈"
      : summary.trend === "down"
        ? "bajaste un poco 📉"
        : "te mantienes estable";
  return `Tu promedio es ${summary.averageScore} en ${summary.totalGames} ${
    summary.totalGames === 1 ? "partida" : "partidas"
  } y ${trend}. Mejor score: ${summary.bestScore}.`;
}
