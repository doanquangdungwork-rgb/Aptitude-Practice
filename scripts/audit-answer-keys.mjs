import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { inflateRawSync } from "node:zlib";

const ROOT = resolve(".");
const parts = Array.from({ length: 20 }, (_, i) => resolve(ROOT, "data/question-bank", `part${String(i).padStart(2,"0")}.ts`));
const tests = new Map();
for (const file of parts) {
  const src = await readFile(file, "utf8");
  const body = src.replace(/^export default\s+/, "").replace(/\]\s+as\s+const\s*;?\s*$/, "]").replace(/;\s*$/, "");
  const rows = Function(`"use strict"; return (${body});`)();
  for (const q of rows) { const list = tests.get(q.testId) ?? []; list.push(q); tests.set(q.testId, list); }
}
const overrideSource = await readFile(resolve(ROOT, "lib/answer-overrides.ts"), "utf8");
const data = overrideSource.match(/const DATA = "([^"]+)"/)?.[1];
if (!data) throw new Error("Cannot locate embedded answer override data.");
let overrides = {};
try {
  const compressed = Buffer.from(data, "base64");
  const json = inflateRawSync(compressed.subarray(10, -8)).toString("utf8");
  overrides = JSON.parse(json);
} catch (error) {
  console.warn("Answer-key audit: embedded override map could not be decoded; auditing source keys only.", error);
}
const report = [];
for (const [testId, qs] of [...tests.entries()].sort()) {
  const rawKeys = qs.map(q => String(q.a ?? "").trim().toUpperCase()).filter(Boolean);
  const effective = qs.map(q => overrides[q.id]?.answer ?? q.a);
  const effectiveKeys = effective.map(v => Array.isArray(v) ? v.join("|") : String(v ?? "").trim().toUpperCase()).filter(Boolean);
  const uniformSource = rawKeys.length >= 3 && new Set(rawKeys).size === 1;
  const uniformEffective = effectiveKeys.length >= 3 && new Set(effectiveKeys).size === 1;
  const optionCounts = [...new Set(qs.map(q => Number(q.optionCount ?? q.o?.length ?? 0)))];
  const invalidSourceKeys = qs.filter(q => /^[A-Z]$/.test(String(q.a ?? "").trim()) && String(q.a).charCodeAt(0)-64 > Number(q.optionCount ?? q.o?.length ?? 0)).map(q=>q.id);
  report.push({ testId, questionCount: qs.length, sourceFile: qs[0]?.sourceFile ?? null, sourceKeyUniform: uniformSource, effectiveKeyUniform: uniformEffective, overrideQuestionCount: qs.filter(q => overrides[q.id]).length, optionCounts, invalidSourceKeys, status: uniformEffective ? "UNVERIFIED_OR_CORRUPTED" : "OK" });
}
const out = resolve(ROOT, "data/answer-key-audit.json");
await mkdir(dirname(out), { recursive: true });
await writeFile(out, JSON.stringify({ generatedAt: new Date().toISOString(), tests: report }, null, 2) + "\n");
const bad = report.filter(x => x.status !== "OK");
console.log(`Answer-key audit: ${report.length} tests, ${bad.length} requiring review.`);
for (const x of bad) console.log(`[ANSWER-KEY-REVIEW] ${x.testId} | source=${x.sourceFile} | questions=${x.questionCount} | overrides=${x.overrideQuestionCount} | uniformEffective=${x.effectiveKeyUniform}`);