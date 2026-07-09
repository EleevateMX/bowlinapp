import type { Game, GamePlayer, StatsSummary, UserProfile } from "@/types";

/**
 * Datos de prueba para la fase de setup (sin Supabase todavía).
 * Todo lo que consume el dashboard/historial sale de aquí.
 */

export const mockUser: UserProfile = {
  id: "mock-user-1",
  email: "edy@strikelab.mx",
  displayName: "Edy",
  plan: "free",
  createdAt: "2026-05-01T10:00:00Z",
};

export const mockStats: StatsSummary = {
  averageScore: 168.4,
  bestScore: 234,
  totalGames: 27,
  strikeRate: 0.31,
  spareRate: 0.42,
  openFrameRate: 0.27,
  trend: "up",
};

/** Últimas partidas (orden: más reciente primero) */
export const mockGames: (Game & { myScore: number; players: number })[] = [
  {
    id: "g-12",
    ownerId: "mock-user-1",
    centerName: "Bol Campestre",
    playedAt: "2026-07-06T21:30:00Z",
    gameType: "casual",
    scoringMode: "final_only",
    myScore: 186,
    players: 3,
  },
  {
    id: "g-11",
    ownerId: "mock-user-1",
    centerName: "Bol Campestre",
    playedAt: "2026-07-06T20:45:00Z",
    gameType: "casual",
    scoringMode: "final_only",
    myScore: 172,
    players: 3,
  },
  {
    id: "g-10",
    ownerId: "mock-user-1",
    centerName: "AMF Interlomas",
    playedAt: "2026-06-29T19:00:00Z",
    gameType: "league",
    scoringMode: "final_only",
    myScore: 234,
    players: 2,
  },
  {
    id: "g-09",
    ownerId: "mock-user-1",
    centerName: "AMF Interlomas",
    playedAt: "2026-06-29T18:10:00Z",
    gameType: "league",
    scoringMode: "final_only",
    myScore: 158,
    players: 2,
  },
  {
    id: "g-08",
    ownerId: "mock-user-1",
    centerName: "Bol Bahía",
    playedAt: "2026-06-21T22:00:00Z",
    gameType: "practice",
    scoringMode: "final_only",
    myScore: 149,
    players: 1,
  },
  {
    id: "g-07",
    ownerId: "mock-user-1",
    centerName: "Bol Bahía",
    playedAt: "2026-06-21T21:05:00Z",
    gameType: "practice",
    scoringMode: "final_only",
    myScore: 175,
    players: 1,
  },
  {
    id: "g-06",
    ownerId: "mock-user-1",
    centerName: "Bol Campestre",
    playedAt: "2026-06-14T20:30:00Z",
    gameType: "casual",
    scoringMode: "final_only",
    myScore: 141,
    players: 3,
  },
  {
    id: "g-05",
    ownerId: "mock-user-1",
    centerName: "Bol Campestre",
    playedAt: "2026-06-07T20:00:00Z",
    gameType: "casual",
    scoringMode: "final_only",
    myScore: 163,
    players: 2,
  },
  {
    id: "g-04",
    ownerId: "mock-user-1",
    centerName: "AMF Interlomas",
    playedAt: "2026-05-31T19:30:00Z",
    gameType: "casual",
    scoringMode: "final_only",
    myScore: 152,
    players: 2,
  },
  {
    id: "g-03",
    ownerId: "mock-user-1",
    centerName: "Bol Bahía",
    playedAt: "2026-05-24T21:00:00Z",
    gameType: "practice",
    scoringMode: "final_only",
    myScore: 138,
    players: 1,
  },
];

/** Serie para la gráfica de evolución (orden cronológico) */
export const mockScoreHistory = [...mockGames]
  .reverse()
  .map((g) => ({
    date: g.playedAt,
    score: g.myScore,
  }));

export const mockPlayersInLastGame: GamePlayer[] = [
  {
    id: "gp-1",
    gameId: "g-12",
    playerId: "p-1",
    playerName: "Edy",
    finalScore: 186,
    position: 1,
  },
  {
    id: "gp-2",
    gameId: "g-12",
    playerId: "p-2",
    playerName: "Ricardo",
    finalScore: 171,
    position: 2,
  },
  {
    id: "gp-3",
    gameId: "g-12",
    playerId: "p-3",
    playerName: "Caro",
    finalScore: 144,
    position: 3,
  },
];
