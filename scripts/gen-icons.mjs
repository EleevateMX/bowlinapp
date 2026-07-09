// Genera los PNG de íconos PWA / apple-touch a partir de los SVG de /public.
// Uso: node scripts/gen-icons.mjs
// Rasteriza con Chromium (vía Playwright) para no depender de librerías nativas.
// Playwright puede estar instalado global; intenta local y cae al global.
const { chromium } = await import("playwright").catch(
  () => import("/opt/node22/lib/node_modules/playwright/index.mjs"),
);
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");
const iconsDir = resolve(publicDir, "icons");
mkdirSync(iconsDir, { recursive: true });

// [archivo SVG fuente, tamaño px, archivo PNG destino]
const targets = [
  ["favicon.svg", 192, "icons/icon-192.png"],
  ["favicon.svg", 512, "icons/icon-512.png"],
  ["icon-maskable.svg", 512, "icons/icon-maskable-512.png"],
  ["icon-maskable.svg", 180, "icons/apple-touch-icon.png"],
];

const executablePath =
  process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const browser = await chromium.launch({ executablePath }).catch(() => chromium.launch());
const page = await browser.newPage();

for (const [svgFile, size, outFile] of targets) {
  const svg = readFileSync(resolve(publicDir, svgFile), "utf8");
  const html = `<!doctype html><html><head><style>
    *{margin:0;padding:0}
    html,body{width:${size}px;height:${size}px;overflow:hidden}
    svg{width:${size}px;height:${size}px;display:block}
  </style></head><body>${svg}</body></html>`;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.screenshot({
    path: resolve(publicDir, outFile),
    clip: { x: 0, y: 0, width: size, height: size },
    omitBackground: false,
  });
  console.log(`✓ ${outFile} (${size}×${size})`);
}

await browser.close();
console.log("Íconos generados en public/icons/");
