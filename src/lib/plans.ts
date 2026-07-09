import type { PlanId } from "@/types";

/** Funciones de la app que se controlan por plan */
export type Feature =
  | "final_score_entry"
  | "frame_by_frame"
  | "pin_by_pin"
  | "basic_history"
  | "unlimited_history"
  | "advanced_stats"
  | "filters"
  | "game_comparison"
  | "export_results"
  | "premium_share_cards"
  | "consistency_analysis"
  | "shot_analysis"
  | "missed_pins"
  | "frequent_splits"
  | "recommendations"
  | "training_plan"
  | "weekly_reports"
  | "ai_coach"
  | "score_prediction"
  | "league_mode"
  | "cloud_backup"
  | "team_support";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  priceMXN: number;
  maxPlayersPerGame: number;
  /** null = ilimitado */
  historyLimit: number | null;
  features: Feature[];
  highlight?: boolean;
}

const FREE_FEATURES: Feature[] = ["final_score_entry", "basic_history"];

const PLUS_FEATURES: Feature[] = [
  ...FREE_FEATURES,
  "frame_by_frame",
  "advanced_stats",
  "unlimited_history",
  "filters",
  "game_comparison",
  "export_results",
  "premium_share_cards",
  "consistency_analysis",
];

const PRO_FEATURES: Feature[] = [
  ...PLUS_FEATURES,
  "pin_by_pin",
  "shot_analysis",
  "missed_pins",
  "frequent_splits",
  "recommendations",
  "training_plan",
  "weekly_reports",
  "ai_coach",
  "score_prediction",
  "league_mode",
  "cloud_backup",
  "team_support",
];

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Gratis",
    tagline: "Registra y comparte tus partidas",
    priceMXN: 0,
    maxPlayersPerGame: 3,
    historyLimit: 10,
    features: FREE_FEATURES,
  },
  plus: {
    id: "plus",
    name: "Plus",
    tagline: "Frame por frame y estadísticas avanzadas",
    priceMXN: 150,
    maxPlayersPerGame: 8,
    historyLimit: null,
    features: PLUS_FEATURES,
    highlight: true,
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "Análisis pin por pin + Coach IA",
    priceMXN: 299,
    maxPlayersPerGame: 10,
    historyLimit: null,
    features: PRO_FEATURES,
  },
};

/** ¿El plan tiene acceso a la función? */
export function hasFeature(plan: PlanId, feature: Feature): boolean {
  return PLANS[plan].features.includes(feature);
}

/** El plan mínimo que desbloquea una función (para mostrar en candados) */
export function minimumPlanFor(feature: Feature): PlanId {
  if (PLANS.free.features.includes(feature)) return "free";
  if (PLANS.plus.features.includes(feature)) return "plus";
  return "pro";
}
