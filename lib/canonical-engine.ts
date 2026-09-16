export type ImageCrop = { x: number; y: number; width: number; height: number };
export type ContentBlock =
  | { type: "text"; value: string }
  | { type: "image"; assetRef: string; alt?: string; crop?: ImageCrop }
  | { type: "mixed"; blocks: ContentBlock[] }
  | { type: "spacer"; size?: "sm" | "md" | "lg" };
export type CanonicalOption = { id: string; content: ContentBlock };
export type CanonicalResponse =
  | { type: "single_choice" }
  | { type: "image_choice" }
  | { type: "multiple_choice"; minSelections?: number; maxSelections?: number }
  | { type: "ranking"; rankCount?: number }
  | { type: "numeric" }
  | { type: "text" }
  | { type: "composite"; parts: Array<{ id: string; type: string }> };
export type CanonicalAnswer =
  | { type: "single"; value: string }
  | { type: "multiple"; values: string[] }
  | { type: "ranking"; parts: Record<string, number> }
  | { type: "numeric"; value: string | number; tolerance?: number }
  | { type: "text"; value: string }
  | { type: "composite"; parts: Record<string, unknown> };
export type CanonicalQuestion = { id: string; number: number; subquestion?: string | null; context?: string; prompt: { blocks: ContentBlock[] }; options: CanonicalOption[]; response: CanonicalResponse; answer: CanonicalAnswer; explanation?: { blocks: ContentBlock[] } | null; taxonomy?: { pillar?: string; subtype?: string }; source?: Record<string, unknown> };
export type CanonicalTest = { id: string; title: string; taxonomy: { pillar: string; subtype?: string }; timing?: { mode: string; limitSeconds?: number }; questions: CanonicalQuestion[] };
export type CanonicalDataset = { schemaVersion: string; assets: Array<{ id: string; path?: string; crop?: Record<string, unknown> }>; tests: CanonicalTest[] };
export function isCanonicalQuestion(value: unknown): value is CanonicalQuestion { const q = value as Partial<CanonicalQuestion> | null; return !!q && typeof q.id === "string" && !!q.prompt && !!q.response && !!q.answer; }
export function optionLabel(option: CanonicalOption, index: number) { return option.id.length <= 2 ? option.id.toUpperCase() : String.fromCharCode(65 + index); }
export function answerKey(answer: CanonicalAnswer): string { if (answer.type === "single" || answer.type === "text") return String(answer.value); if (answer.type === "multiple") return answer.values.slice().sort().join("|"); if (answer.type === "ranking") return JSON.stringify(Object.fromEntries(Object.entries(answer.parts).sort())); if (answer.type === "numeric") return String(answer.value); return JSON.stringify(answer.parts); }
export function normalizeChoice(value: unknown) { return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " "); }
export function normalizeNumber(value: unknown) { const raw = String(value ?? "").trim().replace(/,/g, "").replace(/[£$€%]/g, ""); const match = raw.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/i); return match ? Number(match[0]) : NaN; }
function recordMatches(selected: unknown, expected: Record<string, unknown>) { if (!selected || typeof selected !== "object" || Array.isArray(selected)) return false; const actual = selected as Record<string, unknown>; const a = Object.keys(actual).sort(); const b = Object.keys(expected).sort(); return a.length === b.length && a.every(key => key in expected && normalizeChoice(actual[key]) === normalizeChoice(expected[key])); }
export function answersMatch(question: CanonicalQuestion, selected: unknown): boolean { if (selected === undefined || selected === null || selected === "") return false; const answer = question.answer; if (answer.type === "single" || answer.type === "text") return normalizeChoice(selected) === normalizeChoice(answer.value); if (answer.type === "multiple") { const values = Array.isArray(selected) ? selected.map(String) : String(selected).split(","); return values.map(normalizeChoice).sort().join("|") === answer.values.map(normalizeChoice).sort().join("|"); } if (answer.type === "numeric") { const actual = normalizeNumber(selected); const expected = normalizeNumber(answer.value); if (!Number.isFinite(actual) || !Number.isFinite(expected)) return normalizeChoice(selected) === normalizeChoice(answer.value); return Math.abs(actual - expected) <= (answer.tolerance ?? 0); } if (answer.type === "ranking" || answer.type === "composite") return recordMatches(selected, answer.parts); return false; }
export function questionDisplayText(question: CanonicalQuestion) { return question.prompt.blocks.filter((block): block is Extract<ContentBlock, { type: "text" }> => block.type === "text").map(block => block.value).join("\n").trim(); }
export function questionAssetRefs(question: CanonicalQuestion) { const refs: string[] = []; const walk = (block: ContentBlock) => { if (block.type === "image") refs.push(block.assetRef); if (block.type === "mixed") block.blocks.forEach(walk); }; question.prompt.blocks.forEach(walk); return refs; }
