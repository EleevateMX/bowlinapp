/**
 * Lógica de score de boliche (10 pinos, reglas estándar).
 *
 * Un juego = 10 frames. Frames 1-9 tienen hasta 2 tiros; el frame 10
 * tiene hasta 3 tiros si hay strike o spare.
 *
 * Esta es la versión base usada por el MVP; la Fase 4 la extiende con
 * análisis pin por pin, splits y estadísticas avanzadas.
 */

export interface FrameScore {
  frameNumber: number;
  throws: number[];
  isStrike: boolean;
  isSpare: boolean;
  /** Score acumulado hasta este frame, o null si aún depende de tiros futuros */
  cumulativeScore: number | null;
}

export const MAX_PINS = 10;
export const FRAMES_PER_GAME = 10;
export const MAX_SCORE = 300;

/** Valida que un score final sea posible en boliche estándar */
export function isValidFinalScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0 && score <= MAX_SCORE;
}

/**
 * Valida los tiros de un frame (1-9).
 * Dos tiros no pueden sumar más de 10 pinos.
 */
export function isValidRegularFrame(throws: number[]): boolean {
  if (throws.length < 1 || throws.length > 2) return false;
  if (throws.some((t) => t < 0 || t > MAX_PINS || !Number.isInteger(t)))
    return false;
  if (throws[0] === MAX_PINS) return throws.length === 1; // strike = un tiro
  if (throws.length === 2 && throws[0] + throws[1] > MAX_PINS) return false;
  return true;
}

/**
 * Valida el décimo frame: 2 tiros normalmente, 3 si el primero es strike
 * o los dos primeros suman spare.
 */
export function isValidTenthFrame(throws: number[]): boolean {
  if (throws.length < 2 || throws.length > 3) return false;
  if (throws.some((t) => t < 0 || t > MAX_PINS || !Number.isInteger(t)))
    return false;

  const [t1, t2, t3] = throws;
  const firstIsStrike = t1 === MAX_PINS;
  const isSpare = !firstIsStrike && t1 + t2 === MAX_PINS;

  if (!firstIsStrike && t1 + t2 > MAX_PINS) return false;

  // El tercer tiro solo existe con strike o spare
  if (throws.length === 3 && !firstIsStrike && !isSpare) return false;
  if (throws.length === 2 && (firstIsStrike || isSpare)) return false;

  // Si hubo strike en el primer tiro y el segundo no fue strike,
  // segundo + tercero no pueden sumar más de 10
  if (
    throws.length === 3 &&
    firstIsStrike &&
    t2 !== MAX_PINS &&
    t2 + t3 > MAX_PINS
  ) {
    return false;
  }

  return true;
}

/**
 * Calcula el score de un juego a partir de la lista plana de tiros.
 * Devuelve los 10 frames con su score acumulado (null si aún no se puede
 * resolver porque faltan tiros de bonificación).
 */
export function scoreGame(allThrows: number[]): FrameScore[] {
  const frames: FrameScore[] = [];
  let throwIndex = 0;
  let runningTotal = 0;
  let blocked = false; // una vez que un frame queda pendiente, los siguientes también

  for (let frameNumber = 1; frameNumber <= FRAMES_PER_GAME; frameNumber++) {
    if (throwIndex >= allThrows.length) break;

    const isTenth = frameNumber === FRAMES_PER_GAME;
    const first = allThrows[throwIndex];
    const isStrike = first === MAX_PINS;

    let frameThrows: number[];
    if (isTenth) {
      frameThrows = allThrows.slice(throwIndex, throwIndex + 3);
    } else if (isStrike) {
      frameThrows = [first];
    } else {
      frameThrows = allThrows.slice(throwIndex, throwIndex + 2);
    }
    throwIndex += frameThrows.length;

    const isSpare =
      !isStrike &&
      frameThrows.length >= 2 &&
      frameThrows[0] + frameThrows[1] === MAX_PINS;

    let frameScore: number | null = null;

    if (isTenth) {
      const complete =
        isStrike || isSpare ? frameThrows.length === 3 : frameThrows.length === 2;
      if (complete) {
        frameScore = frameThrows.reduce((a, b) => a + b, 0);
      }
    } else if (isStrike) {
      const bonus = allThrows.slice(throwIndex, throwIndex + 2);
      if (bonus.length === 2) frameScore = MAX_PINS + bonus[0] + bonus[1];
    } else if (isSpare) {
      const bonus = allThrows.slice(throwIndex, throwIndex + 1);
      if (bonus.length === 1) frameScore = MAX_PINS + bonus[0];
    } else if (frameThrows.length === 2) {
      frameScore = frameThrows[0] + frameThrows[1];
    }

    if (frameScore === null) blocked = true;

    let cumulativeScore: number | null = null;
    if (!blocked && frameScore !== null) {
      runningTotal += frameScore;
      cumulativeScore = runningTotal;
    }

    frames.push({
      frameNumber,
      throws: frameThrows,
      isStrike,
      isSpare,
      cumulativeScore,
    });
  }

  return frames;
}

/** Score total de un juego completo (0 si no hay frames resueltos) */
export function totalScore(allThrows: number[]): number {
  const frames = scoreGame(allThrows);
  const last = [...frames].reverse().find((f) => f.cumulativeScore !== null);
  return last?.cumulativeScore ?? 0;
}

/** Promedio de una lista de scores finales */
export function averageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(
    (scores.reduce((a, b) => a + b, 0) / scores.length) * 10,
  ) / 10;
}

/** Mejor score de una lista */
export function bestScore(scores: number[]): number {
  return scores.length > 0 ? Math.max(...scores) : 0;
}

/**
 * Tendencia simple: compara el promedio de la mitad reciente contra
 * la mitad anterior (las listas llegan en orden cronológico).
 */
export function scoreTrend(scores: number[]): "up" | "down" | "flat" {
  if (scores.length < 4) return "flat";
  const half = Math.floor(scores.length / 2);
  const older = averageScore(scores.slice(0, half));
  const recent = averageScore(scores.slice(half));
  const delta = recent - older;
  if (delta > 3) return "up";
  if (delta < -3) return "down";
  return "flat";
}
