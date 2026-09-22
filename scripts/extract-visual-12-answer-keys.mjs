import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const ASSET_DIR = resolve("public/question-assets");
const OUTPUT = resolve("data/visual-12-answer-keys.json");
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function cyanPixelsInRightHalf(data, info) {
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1, count = 0;
  const startX = Math.floor(info.width * 0.42);
  for (let y = 0; y < info.height; y++) {
    for (let x = startX; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r < 100 && g > 120 && b > 150 && b - r > 70 && g - r > 45) {
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (count < 80 || maxX < minX || maxY < minY) return null;
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1, count };
}

function darkScore(data, info, x, y, horizontal) {
  let hits = 0, total = 0;
  const radius = 3;
  if (horizontal) {
    if (y < 0 || y >= info.height) return 0;
    for (let yy = Math.max(0, y - radius); yy <= Math.min(info.height - 1, y + radius); yy++) {
      for (let xx = x; xx < Math.min(info.width, x + 1); xx++) {
        total++;
        const i = (yy * info.width + xx) * info.channels;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (Math.max(r, g, b) < 210 || (b > 150 && g > 120 && b - r > 60)) hits++;
      }
    }
  } else {
    if (x < 0 || x >= info.width) return 0;
    for (let xx = Math.max(0, x - radius); xx <= Math.min(info.width - 1, x + radius); xx++) {
      for (let yy = y; yy < Math.min(info.height, y + 1); yy++) {
        total++;
        const i = (yy * info.width + xx) * info.channels;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (Math.max(r, g, b) < 210 || (b > 150 && g > 120 && b - r > 60)) hits++;
      }
    }
  }
  return total ? hits / total : 0;
}

function lineScore(data, info, x, y, horizontal, length) {
  let best = 0;
  const tolerance = 3;
  for (let delta = -tolerance; delta <= tolerance; delta++) {
    let hits = 0, total = 0;
    if (horizontal) {
      const yy = y + delta;
      if (yy < 0 || yy >= info.height) continue;
      const x0 = Math.max(0, x), x1 = Math.min(info.width - 1, x + length);
      for (let xx = x0; xx <= x1; xx += 2) {
        total++;
        const i = (yy * info.width + xx) * info.channels;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (Math.max(r, g, b) < 210 || (b > 150 && g > 120 && b - r > 60)) hits++;
      }
    } else {
      const xx = x + delta;
      if (xx < 0 || xx >= info.width) continue;
      const y0 = Math.max(0, y), y1 = Math.min(info.height - 1, y + length);
      for (let yy = y0; yy <= y1; yy += 2) {
        total++;
        const i = (yy * info.width + xx) * info.channels;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (Math.max(r, g, b) < 210 || (b > 150 && g > 120 && b - r > 60)) hits++;
      }
    }
    best = Math.max(best, total ? hits / total : 0);
  }
  return best;
}

async function detect12ChoiceAnswer(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const cyan = cyanPixelsInRightHalf(data, info);
  if (!cyan) return { status: "no-cyan" };

  const cw = cyan.width;
  const ch = cyan.height;
  if (cw < 20 || ch < 20) return { status: "invalid-cyan-box", cyan };

  let best = null;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const x0 = cyan.minX - col * cw;
      const y0 = cyan.minY - row * ch;
      if (x0 < 0 || y0 < 0 || x0 + 4 * cw >= info.width || y0 + 3 * ch >= info.height) continue;
      let score = 0;
      const vertical = [];
      const horizontal = [];
      for (let i = 0; i <= 4; i++) vertical.push(lineScore(data, info, x0 + i * cw, y0, false, 3 * ch));
      for (let i = 0; i <= 3; i++) horizontal.push(lineScore(data, info, x0, y0 + i * ch, true, 4 * cw));
      score = [...vertical, ...horizontal].reduce((a, b) => a + b, 0) / (vertical.length + horizontal.length);
      const minBoundary = Math.min(...vertical, ...horizontal);
      if (!best || score > best.score) best = { row, col, score, minBoundary, x0, y0, cw, ch };
    }
  }

  if (!best || best.score < 0.35 || best.minBoundary < 0.15) return { status: "ambiguous", cyan, best };
  const index = best.row * 4 + best.col;
  return { status: "ok", answer: LETTERS[index], row: best.row, col: best.col, score: best.score, minBoundary: best.minBoundary };
}

async function main() {
  if (!existsSync(ASSET_DIR)) throw new Error(`Missing asset directory: ${ASSET_DIR}`);
  const files = readdirSync(ASSET_DIR);
  const out = {};
  const diagnostics = [];
  for (let test = 45; test <= 59; test++) {
    const assetTest = String(test).padStart(3, "0");
    for (let q = 1; q <= 30; q++) {
      const name = `LOGICAL_${assetTest}_Q${String(q).padStart(3, "0")}_solution.webp`;
      if (!files.includes(name)) continue;
      const detected = await detect12ChoiceAnswer(resolve(ASSET_DIR, name));
      if (detected.status === "ok") {
        out[`TEST_${assetTest}_Q${q}`] = { answer: detected.answer, source: name, row: detected.row, col: detected.col };
      } else {
        diagnostics.push({ testId: `TEST_${assetTest}`, question: q, file: name, ...detected });
      }
    }
  }
  mkdirSync(resolve("data"), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`Visual 12-choice answer extraction: ${Object.keys(out).length} mapped, ${diagnostics.length} unresolved.`);
  for (const [id, value] of Object.entries(out)) console.log(`[visual-key] ${id} = ${value.answer} (${value.source})`);
  for (const item of diagnostics) console.warn(`[visual-key-unresolved] ${item.testId}_Q${item.question}: ${item.status}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
