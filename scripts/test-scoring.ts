// Prueba de la lógica de score. Se corre con:
//   node --experimental-strip-types scripts/test-scoring.ts
import {
  scoreGame,
  totalScore,
  averageScore,
  bestScore,
  scoreTrend,
  isValidFinalScore,
  isValidRegularFrame,
  isValidTenthFrame,
  standardDeviation,
  consistencyIndex,
} from "../src/lib/scoring.ts";
import { nextThrow, addThrow } from "../src/lib/frame-input.ts";
import {
  pinState,
  pinAddThrow,
  pinUndoThrow,
  pinsToCounts,
  missedPins,
  countSplits,
} from "../src/lib/pin-input.ts";

let passed = 0;
let failed = 0;

function eq(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}\n      esperado: ${JSON.stringify(want)}\n      obtenido: ${JSON.stringify(got)}`);
  }
}

console.log("\nScore total:");
// Juego perfecto: 12 strikes = 300
eq("juego perfecto = 300", totalScore(Array(12).fill(10)), 300);
// Todos spares de 5, +5 de bono en el 10mo = 150
eq("todos spares (5/5) = 150", totalScore([...Array(20).fill(5), 5]), 150);
// Todo canaleta = 0
eq("todo gutter = 0", totalScore(Array(20).fill(0)), 0);
// Juego abierto simple: 9-0 en cada frame = 90
eq("open frames 9-0 = 90", totalScore(Array(10).fill(0).flatMap(() => [9, 0])), 90);
// Ejemplo mixto clásico: strike, 7/, 9-0... verificable a mano
// Frame1: X (10 + 7 + 3 = 20), Frame2: 7/ (10 + 9 = 19), Frame3: 9- (9)... resto 0
eq(
  "mixto X,7/,9- = 20+19+9 = 48",
  totalScore([10, 7, 3, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  48,
);

console.log("\nDetección de strike/spare:");
const frames = scoreGame(Array(12).fill(10));
eq("frame 1 es strike", frames[0].isStrike, true);
eq("juego perfecto tiene 10 frames", frames.length, 10);
eq("score acumulado del frame 10 = 300", frames[9].cumulativeScore, 300);

const spareGame = scoreGame([7, 3, 4, 5]);
eq("7,3 es spare", spareGame[0].isSpare, true);
eq("4,5 no es spare ni strike", spareGame[1].isSpare === false && spareGame[1].isStrike === false, true);
eq("frame con spare pendiente de bono = null hasta el siguiente tiro no... aquí ya hay tiro 4 → 10+4=14", spareGame[0].cumulativeScore, 14);

console.log("\nValidaciones:");
eq("300 es score válido", isValidFinalScore(300), true);
eq("301 es inválido", isValidFinalScore(301), false);
eq("-1 es inválido", isValidFinalScore(-1), false);
eq("150.5 es inválido (no entero)", isValidFinalScore(150.5), false);
eq("frame [7,3] válido", isValidRegularFrame([7, 3]), true);
eq("frame [7,4] inválido (>10)", isValidRegularFrame([7, 4]), false);
eq("frame [10] válido (strike)", isValidRegularFrame([10]), true);
eq("10mo [10,10,10] válido", isValidTenthFrame([10, 10, 10]), true);
eq("10mo [7,3,9] válido (spare + bono)", isValidTenthFrame([7, 3, 9]), true);
eq("10mo [3,4,5] inválido (sin strike/spare no hay 3er tiro)", isValidTenthFrame([3, 4, 5]), false);
eq("10mo [9,2] inválido (>10 sin ser strike)", isValidTenthFrame([9, 2]), false);

console.log("\nAgregados:");
eq("promedio [150,200,175] = 175", averageScore([150, 200, 175]), 175);
eq("mejor de [150,234,180] = 234", bestScore([150, 234, 180]), 234);
eq("tendencia subiendo", scoreTrend([120, 130, 125, 160, 170, 175]), "up");
eq("tendencia bajando", scoreTrend([180, 175, 170, 130, 125, 120]), "down");
eq("tendencia plana con pocos datos", scoreTrend([150, 160]), "flat");

console.log("\nCaptura frame por frame:");
eq("juego vacío → frame 1, tiro 1, max 10", nextThrow([]), {
  frameNumber: 1,
  throwInFrame: 1,
  maxPins: 10,
  isComplete: false,
});
eq("tras tirar 7 → tiro 2, max 3", nextThrow([7]), {
  frameNumber: 1,
  throwInFrame: 2,
  maxPins: 3,
  isComplete: false,
});
eq("tras strike → frame 2, tiro 1", nextThrow([10]), {
  frameNumber: 2,
  throwInFrame: 1,
  maxPins: 10,
  isComplete: false,
});
eq("no deja tirar más de lo posible (7 luego 5 → ignora)", addThrow([7], 5), [7]);
eq("sí deja completar spare (7 luego 3)", addThrow([7], 3), [7, 3]);
// Juego perfecto: 12 strikes → completo
const perfect = Array(12).fill(10);
eq("juego perfecto está completo", nextThrow(perfect).isComplete, true);
// 10mo frame con spare da tercer tiro
eq(
  "spare en el 10mo habilita 3er tiro",
  nextThrow([...Array(18).fill(0), 7, 3]),
  { frameNumber: 10, throwInFrame: 3, maxPins: 10, isComplete: false },
);
// Juego abierto (todos 9-0) queda completo tras 20 tiros
eq("20 tiros abiertos → completo", nextThrow(Array(10).fill(0).flatMap(() => [9, 0])).isComplete, true);

console.log("\nEstadísticas avanzadas:");
eq("desviación de scores idénticos = 0", standardDeviation([150, 150, 150]), 0);
eq("desviación de [100,200] = 50", standardDeviation([100, 200]), 50);
eq("consistencia perfecta (idénticos) = 1", consistencyIndex([170, 170, 170]), 1);
eq(
  "consistencia baja con scores muy dispersos < 0.5",
  consistencyIndex([80, 250, 90, 240]) < 0.5,
  true,
);
eq("consistencia con <2 datos = 0", consistencyIndex([150]), 0);

console.log("\nCaptura pin por pin:");
// Juego vacío: primer tiro, 10 pinos de pie
eq("pin: vacío → frame 1 tiro 1, 10 de pie", pinState([]).standing.length, 10);
// Tirar 8 pinos (quedan 7 y 10 de pie = split clásico)
let pf: number[][][] = [];
pf = pinAddThrow(pf, [1, 2, 3, 4, 5, 6, 8, 9]); // deja 7 y 10
const st = pinState(pf);
eq("pin: tras primer tiro quedan 7 y 10", st.standing, [7, 10]);
eq("pin: es tiro 2 del frame 1", st.throwInFrame === 2 && st.frameNumber === 1, true);
eq("pin: conteo del tiro = 8", pinsToCounts(pf), [8]);
// No deja derribar un pino que ya cayó
eq("pin: no permite pino ya derribado", pinAddThrow(pf, [5]), pf);
// Deshacer
eq("pin: deshacer deja el juego vacío", pinUndoThrow(pf), []);
// Strike pin por pin
eq("pin: strike (10 pinos) pasa al frame 2", pinState([[[1,2,3,4,5,6,7,8,9,10]]]).frameNumber, 2);
// Split 7-10 se detecta
eq("pin: 7-10 es split", countSplits([[[1,2,3,4,5,6,8,9]]]), 1);
// Si el headpin queda de pie, no es split
eq("pin: headpin de pie no es split", countSplits([[[2,3,4,5,6]]]), 0);
// Pines fallados: quedaron 7 y 10 sin cerrar
eq("pin: pines fallados incluyen 7 y 10", missedPins([[[1,2,3,4,5,6,8,9],[]]]).sort((a,b)=>a-b), [7,10]);

console.log(`\n${passed} pasaron, ${failed} fallaron\n`);
if (failed > 0) process.exit(1);
