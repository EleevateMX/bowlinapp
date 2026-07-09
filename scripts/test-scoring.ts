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
} from "../src/lib/scoring.ts";

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

console.log(`\n${passed} pasaron, ${failed} fallaron\n`);
if (failed > 0) process.exit(1);
