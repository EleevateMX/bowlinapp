/**
 * Helpers para capturar un juego tiro por tiro (frame por frame).
 * Trabaja sobre una lista plana de tiros y sabe, en cada momento, en qué
 * frame vas y cuántos pinos puedes derribar en el siguiente tiro.
 */
import { FRAMES_PER_GAME, MAX_PINS } from "./scoring.ts";

export interface NextThrow {
  frameNumber: number; // 1-10
  throwInFrame: number; // 1, 2 o 3 (solo el 10mo llega a 3)
  maxPins: number; // máximo de pinos permitidos en este tiro
  isComplete: boolean; // el juego ya está completo
}

/** Determina el estado del siguiente tiro a partir de los tiros ya hechos */
export function nextThrow(throws: number[]): NextThrow {
  let i = 0;

  for (let frame = 1; frame <= FRAMES_PER_GAME; frame++) {
    const isTenth = frame === FRAMES_PER_GAME;

    if (!isTenth) {
      const first = throws[i];
      if (first === undefined)
        return { frameNumber: frame, throwInFrame: 1, maxPins: MAX_PINS, isComplete: false };
      if (first === MAX_PINS) {
        i += 1; // strike → siguiente frame
        continue;
      }
      const second = throws[i + 1];
      if (second === undefined)
        return {
          frameNumber: frame,
          throwInFrame: 2,
          maxPins: MAX_PINS - first,
          isComplete: false,
        };
      i += 2;
    } else {
      const t1 = throws[i];
      if (t1 === undefined)
        return { frameNumber: 10, throwInFrame: 1, maxPins: MAX_PINS, isComplete: false };

      const t2 = throws[i + 1];
      if (t2 === undefined)
        return {
          frameNumber: 10,
          throwInFrame: 2,
          maxPins: t1 === MAX_PINS ? MAX_PINS : MAX_PINS - t1,
          isComplete: false,
        };

      const earnedThird = t1 === MAX_PINS || t1 + t2 === MAX_PINS;
      if (earnedThird && throws[i + 2] === undefined) {
        let maxThird: number;
        if (t1 === MAX_PINS) {
          // Tras dos strikes, rack nuevo; si no, lo que reste
          maxThird = t2 === MAX_PINS ? MAX_PINS : MAX_PINS - t2;
        } else {
          maxThird = MAX_PINS; // spare → rack nuevo
        }
        return { frameNumber: 10, throwInFrame: 3, maxPins: maxThird, isComplete: false };
      }

      return {
        frameNumber: 10,
        throwInFrame: earnedThird ? 3 : 2,
        maxPins: 0,
        isComplete: true,
      };
    }
  }

  return { frameNumber: 10, throwInFrame: 2, maxPins: 0, isComplete: true };
}

/** Agrega un tiro si es válido; si no, devuelve la lista sin cambios */
export function addThrow(throws: number[], pins: number): number[] {
  const info = nextThrow(throws);
  if (info.isComplete) return throws;
  if (!Number.isInteger(pins) || pins < 0 || pins > info.maxPins) return throws;
  return [...throws, pins];
}

/** Deshace el último tiro */
export function removeLastThrow(throws: number[]): number[] {
  return throws.slice(0, -1);
}

/** Símbolo de un tiro para la hoja de score (X, /, -, o el número) */
export function throwSymbol(
  pins: number,
  opts: { isStrike?: boolean; isSpare?: boolean } = {},
): string {
  if (opts.isStrike) return "X";
  if (opts.isSpare) return "/";
  if (pins === 0) return "-";
  return String(pins);
}
