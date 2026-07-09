/**
 * Almacén local para el MODO DEMO (sin Supabase).
 *
 * Persiste las partidas en localStorage para que el bundle funcione de forma
 * autónoma: registrar partidas, verlas en el historial y calcular estadísticas
 * — todo sin backend. Al conectar Supabase, los servicios dejan de usar esto.
 */
import { mockGames } from "./mock-data";
import { scoreGame, scoreTrend } from "./scoring";
import type { GameType, ScoringMode, StatsSummary } from "@/types";

const KEY = "strikelab-demo-games";

export interface DemoPlayer {
  name: string;
  isSelf: boolean;
  finalScore: number;
  throws?: number[];
}

export interface DemoGame {
  id: string;
  centerName: string | null;
  playedAt: string;
  gameType: GameType;
  scoringMode: ScoringMode;
  players: DemoPlayer[];
}

/** Semilla: convierte las partidas de ejemplo en partidas del store */
function seed(): DemoGame[] {
  return mockGames.map((g) => {
    const players: DemoPlayer[] = [
      { name: "Yo", isSelf: true, finalScore: g.myScore },
    ];
    for (let i = 2; i <= g.players; i++) {
      players.push({
        name: `Jugador ${i}`,
        isSelf: false,
        finalScore: Math.max(90, g.myScore - i * 7),
      });
    }
    return {
      id: g.id,
      centerName: g.centerName ?? null,
      playedAt: g.playedAt,
      gameType: g.gameType,
      scoringMode: g.scoringMode,
      players,
    };
  });
}

function read(): DemoGame[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seeded = seed();
      localStorage.setItem(KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as DemoGame[];
  } catch {
    return seed();
  }
}

function write(games: DemoGame[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(games));
  } catch {
    /* almacenamiento no disponible: se ignora en demo */
  }
}

/** Partidas ordenadas de más reciente a más antigua */
export function demoListGames(limit?: number): DemoGame[] {
  const games = read().sort((a, b) => b.playedAt.localeCompare(a.playedAt));
  return limit ? games.slice(0, limit) : games;
}

export interface DemoNewGame {
  centerName: string | null;
  gameType: GameType;
  scoringMode: ScoringMode;
  players: DemoPlayer[];
}

export function demoCreateGame(input: DemoNewGame): string {
  const games = read();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `g-${games.length + 1}-${Date.now()}`;
  games.unshift({
    id,
    centerName: input.centerName,
    playedAt: new Date().toISOString(),
    gameType: input.gameType,
    scoringMode: input.scoringMode,
    players: input.players,
  });
  write(games);
  return id;
}

function selfScore(g: DemoGame): number {
  return g.players.find((p) => p.isSelf)?.finalScore ?? 0;
}

/** Estadísticas calculadas localmente (equivalen a las funciones SQL) */
export function demoStats(): StatsSummary {
  const games = demoListGames();
  const scores = games.map(selfScore);

  let strikes = 0;
  let spares = 0;
  let opens = 0;
  let frames = 0;
  for (const g of games) {
    const self = g.players.find((p) => p.isSelf);
    if (self?.throws && self.throws.length > 0) {
      for (const f of scoreGame(self.throws)) {
        frames++;
        if (f.isStrike) strikes++;
        else if (f.isSpare) spares++;
        else opens++;
      }
    }
  }

  return {
    averageScore:
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
          10
        : 0,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    totalGames: games.length,
    strikeRate: frames > 0 ? strikes / frames : 0,
    spareRate: frames > 0 ? spares / frames : 0,
    openFrameRate: frames > 0 ? opens / frames : 0,
    // scores viene en orden descendente; scoreTrend espera cronológico
    trend: scoreTrend([...scores].reverse()),
  };
}

export function demoScoreHistory(limit = 10): { date: string; score: number }[] {
  return demoListGames(limit)
    .map((g) => ({ date: g.playedAt, score: selfScore(g) }))
    .reverse();
}
