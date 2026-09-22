import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const ASSET_DIR = resolve("public/question-assets");
const CATALOG = resolve("data/catalog.json");
const OUTPUT = resolve("data/visual-12-answer-keys.json");
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function cyanPixelsInRightHalf(data, info) {
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1, count = 0;
  const startX = Math.floor(info.width * 0.35);
  for (let y = 0; y < info.height; y++) {
    for (let x = startX; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r < 120 && g > 120 && b > 145 && b - r > 55 && g - r > 35) {
        count++;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (count < 80 || maxX < minX || maxY < minY) return null;
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1, count };
}

function lineScore(data, info, x, y, horizontal, length) {
  let best = 0;
  for (let delta = -3; delta <= 3; delta++) {
    let hits = 0, total = 0;
    if (horizontal) {
      const yy = y + delta;
      if (yy < 0 || yy >= info.height) continue;
      const x0 = Math.max(0, x), x1 = Math.min(info.width - 1, x + length);
      for (let xx = x0; xx <= x1; xx += 2) {
        total++;
        const i = (yy * info.width + xx) * info.channels;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (Math.max(r, g, b) < 210 || (b > 150 && g > 120 && b - r > 55)) hits++;
      }
    } else {
      const xx = x + delta;
      if (xx < 0 || xx >= info.width) continue;
      const y0 = Math.max(0, y), y1 = Math.min(info.height - 1, y + length);
      for (let yy = y0; yy <= y1; yy += 2) {
        total++;
        const i = (yy * info.width + xx) * info.channels;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (Math.max(r, g, b) < 210 || (b > 150 && g > 120 && b - r > 55)) hits++;
      }
    }
    best = Math.max(best, total ? hits / total : 0);
  }
  return best;
}

function scoreGrid(data, info, cyan, rows, cols, row, col) {
  const cw = cyan.width;
  const ch = cyan.height;
  const x0 = cyan.minX - col * cw;
  const y0 = cyan.minY - row * ch;
  const right = x0 + cols * cw;
  const bottom = y0 + rows * ch;
  if (x0 < 0 || y0 < 0 || right >= info.width || bottom >= info.height) return null;

  const vertical = [];
  const horizontal = [];
  for (let i = 0; i <= cols; i++) vertical.push(lineScore(data, info, x0 + i * cw, y0, false, rows * ch));
  for (let i = 0; i <= rows; i++) horizontal.push(lineScore(data, info, x0, y0 + i * ch, true, cols * cw));

  const score = [...vertical, ...horizontal].reduce((a, b) => a + b, 0) / (vertical.length + horizontal.length);
  const minBoundary = Math.min(...vertical, ...horizontal);
  return { rows, cols, row, col, score, minBoundary, x0, y0, cw, ch };
}

async function detect12ChoiceAnswer(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const cyan = cyanPixelsInRightHalf(data, info);
  if (!cyan) return { status: "no-cyan" };
  if (cyan.width < 12 || cyan.height < 12) return { status: "invalid-cyan-box", cyan };

  const candidates = [];
  for (const [rows, cols] of [[3, 4], [4, 3]]) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const candidate = scoreGrid(data, info, cyan, rows, cols, row, col);
        if (candidate) candidates.push(candidate);
      }
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  const best = candidates[0];
  if (!best || best.rows * best.cols !== 12 || best.score < 0.30 || best.minBoundary < 0.12) {
    return { status: "not-12-choice-or-ambiguous", cyan, best };
  }

  const index = best.row * best.cols + best.col;
  return {
    status: "ok",
    answer: LETTERS[index],
    row: best.row,
    col: best.col,
    rows: best.rows,
    cols: best.cols,
    score: best.score,
    minBoundary: best.minBoundary,
  };
}

function logicalTestIdByNumber() {
  const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));
  const map = new Map();
  for (const test of catalog.tests ?? []) {
    const match = /^Logical Reasoning Test (\d+)$/.exec(String(test.title ?? ""));
    if (match) map.set(Number(match[1]), String(test.test_id));
  }
  return map;
}

async function main() {
  if (!existsSync(ASSET_DIR)) throw new Error(`Missing asset directory: ${ASSET_DIR}`);
  if (!existsSync(CATALOG)) throw new Error(`Missing catalog: ${CATALOG}`);

  const files = readdirSync(ASSET_DIR);
  const testIdByNumber = logicalTestIdByNumber();
  const out = {};
  const diagnostics = [];

  for (const name of files) {
    const match = /^LOGICAL_(\d+)_Q(\d+)_solution\.webp$/.exec(name);
    if (!match) continue;

    const assetNumber = Number(match[1]);
    const question = Number(match[2]);
    const testId = testIdByNumber.get(assetNumber);
    if (!testId) {
      diagnostics.push({ file: name, status: "no-catalog-test-id", assetNumber });
      continue;
    }

    const detected = await detect12ChoiceAnswer(resolve(ASSET_DIR, name));
    if (detected.status === "ok") {
      out[`${testId}_Q${question}`] = {
        answer: detected.answer,
        source: name,
        assetTestNumber: assetNumber,
        row: detected.row,
        col: detected.col,
        rows: detected.rows,
        cols: detected.cols,
      };
    } else {
      diagnostics.push({ testId, question, file: name, ...detected });
    }
  }

  mkdirSync(resolve("data"), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(out, null, 2) + "\n");

  console.log(`Visual 12-choice answer extraction: ${Object.keys(out).length} mapped, ${diagnostics.length} unresolved.`);
  for (const [id, value] of Object.entries(out)) {
    console.log(`[visual-key] ${id} = ${value.answer} (${value.source})`);
  }
  for (const item of diagnostics) {
    console.warn(`[visual-key-unresolved] ${item.testId ?? item.file} Q${item.question ?? "?"}: ${item.status}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
