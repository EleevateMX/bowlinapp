/**
 * Captura pin por pin. Un juego se representa como frames → tiros → pinos
 * derribados en ese tiro (1-10). De aquí se derivan los conteos para el score
 * y el análisis de pines más fallados y splits.
 */
import { FRAMES_PER_GAME, MAX_PINS } from "./scoring.ts";

export const ALL_PINS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Vecinos físicos de cada pino (para detectar splits por componentes) */
const NEIGHBORS: Record<number, number[]> = {
  1: [2, 3],
  2: [1, 3, 4, 5],
  3: [1, 2, 5, 6],
  4: [2, 5, 7, 8],
  5: [2, 3, 4, 6, 8, 9],
  6: [3, 5, 9, 10],
  7: [4, 8],
  8: [4, 5, 7, 9],
  9: [5, 6, 8, 10],
  10: [6, 9],
};

export interface PinState {
  frameNumber: number; // 1-10
  throwInFrame: number; // 1, 2 o 3
  standing: number[]; // pinos disponibles para derribar ahora
  isComplete: boolean;
}

const without = (pins: number[], knocked: number[]) =>
  pins.filter((p) => !knocked.includes(p));

/** Estado actual de captura a partir de los frames ya registrados */
export function pinState(frames: number[][][]): PinState {
  for (let f = 0; f < FRAMES_PER_GAME; f++) {
    const isTenth = f === FRAMES_PER_GAME - 1;
    const frame = frames[f] ?? [];

    if (!isTenth) {
      if (frame.length === 0)
        return { frameNumber: f + 1, throwInFrame: 1, standing: ALL_PINS, isComplete: false };
      const t1 = frame[0];
      if (t1.length === MAX_PINS) continue; // strike → siguiente frame
      if (frame.length === 1)
        return {
          frameNumber: f + 1,
          throwInFrame: 2,
          standing: without(ALL_PINS, t1),
          isComplete: false,
        };
      continue; // 2 tiros hechos
    }

    // Décimo frame
    if (frame.length === 0)
      return { frameNumber: 10, throwInFrame: 1, standing: ALL_PINS, isComplete: false };
    const t1 = frame[0];
    const t1Strike = t1.length === MAX_PINS;
    if (frame.length === 1)
      return {
        frameNumber: 10,
        throwInFrame: 2,
        standing: t1Strike ? ALL_PINS : without(ALL_PINS, t1),
        isComplete: false,
      };
    const t2 = frame[1];
    const t2Strike = t2.length === MAX_PINS;
    const spare = !t1Strike && t1.length + t2.length === MAX_PINS;
    const earnedThird = t1Strike || spare;
    if (frame.length === 2) {
      if (!earnedThird)
        return { frameNumber: 10, throwInFrame: 2, standing: [], isComplete: true };
      let standing: number[];
      if (t1Strike && t2Strike) standing = ALL_PINS;
      else if (t1Strike) standing = without(ALL_PINS, t2);
      else standing = ALL_PINS; // spare → rack nuevo
      return { frameNumber: 10, throwInFrame: 3, standing, isComplete: false };
    }
    return { frameNumber: 10, throwInFrame: 3, standing: [], isComplete: true };
  }
  return { frameNumber: 10, throwInFrame: 1, standing: [], isComplete: true };
}

/** Registra un tiro (pinos derribados) si es válido */
export function pinAddThrow(
  frames: number[][][],
  knocked: number[],
): number[][][] {
  const st = pinState(frames);
  if (st.isComplete) return frames;
  if (!knocked.every((p) => st.standing.includes(p))) return frames;

  const copy = frames.map((fr) => fr.map((t) => [...t]));
  const idx = st.frameNumber - 1;
  if (!copy[idx]) copy[idx] = [];
  copy[idx].push([...knocked].sort((a, b) => a - b));
  return copy;
}

/** Deshace el último tiro */
export function pinUndoThrow(frames: number[][][]): number[][][] {
  const copy = frames.map((fr) => fr.map((t) => [...t]));
  for (let i = copy.length - 1; i >= 0; i--) {
    if (copy[i].length > 0) {
      copy[i].pop();
      if (copy[i].length === 0) copy.length = i;
      break;
    }
    copy.length = i;
  }
  return copy;
}

/** Conteos de pinos por tiro (para alimentar el score) */
export function pinsToCounts(frames: number[][][]): number[] {
  return frames.flatMap((fr) => fr.map((t) => t.length));
}

/** Pinos que quedaron de pie al cerrar cada frame 1-9 (fallados) */
export function missedPins(frames: number[][][]): number[] {
  const missed: number[] = [];
  frames.forEach((frame, idx) => {
    if (idx === 9) return; // el 10mo tiene racks múltiples; se omite
    const knocked = new Set(frame.flat());
    if (knocked.size < MAX_PINS) {
      ALL_PINS.forEach((p) => {
        if (!knocked.has(p)) missed.push(p);
      });
    }
  });
  return missed;
}

/** ¿La configuración tras el primer tiro es un split? (headpin caído + gap) */
function isSplit(standingAfterFirst: number[], firstKnocked: number[]): boolean {
  if (standingAfterFirst.length < 2) return false;
  if (!firstKnocked.includes(1)) return false; // headpin de pie → no es split

  const set = new Set(standingAfterFirst);
  const seen = new Set<number>();
  let components = 0;
  for (const p of standingAfterFirst) {
    if (seen.has(p)) continue;
    components++;
    const stack = [p];
    while (stack.length) {
      const c = stack.pop()!;
      if (seen.has(c)) continue;
      seen.add(c);
      for (const n of NEIGHBORS[c]) if (set.has(n) && !seen.has(n)) stack.push(n);
    }
  }
  return components >= 2;
}

/** Cuenta cuántos frames 1-9 dejaron un split tras el primer tiro */
export function countSplits(frames: number[][][]): number {
  let splits = 0;
  frames.forEach((frame, idx) => {
    if (idx === 9 || frame.length === 0) return;
    const t1 = frame[0];
    if (t1.length === MAX_PINS) return; // strike
    if (isSplit(without(ALL_PINS, t1), t1)) splits++;
  });
  return splits;
}
