/** Planes de suscripción de StrikeLab */
export type PlanId = "free" | "plus" | "pro";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  plan: PlanId;
  createdAt: string;
}

export interface Player {
  id: string;
  ownerId: string;
  name: string;
  avatarUrl?: string;
  isOwner: boolean;
}

export interface BowlingCenter {
  id: string;
  name: string;
  city?: string;
}

export type GameType = "practice" | "casual" | "league" | "tournament";

export type ScoringMode = "final_only" | "frame_by_frame" | "pin_by_pin";

export interface Game {
  id: string;
  ownerId: string;
  centerId?: string;
  centerName?: string;
  playedAt: string;
  gameType: GameType;
  scoringMode: ScoringMode;
  notes?: string;
}

export interface GamePlayer {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  finalScore: number;
  position: number;
}

/** Un frame registrado (modo frame por frame / pin por pin) */
export interface Frame {
  frameNumber: number; // 1-10
  throws: number[]; // pines derribados por tiro (2 tiros, 3 en el 10mo)
  isStrike: boolean;
  isSpare: boolean;
  isSplit: boolean;
  cumulativeScore: number | null; // null si aún no se puede calcular
}

/** Resumen de estadísticas para el dashboard */
export interface StatsSummary {
  averageScore: number;
  bestScore: number;
  totalGames: number;
  strikeRate: number;
  spareRate: number;
  openFrameRate: number;
  trend: "up" | "down" | "flat";
}
