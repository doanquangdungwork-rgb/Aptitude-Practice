import { allQuestions, appCatalog } from "./data";
import type { CanonicalQuestion, CanonicalTest, ContentBlock } from "./canonical-engine";
import canonicalTest001 from "../data/canonical/TEST_001.json";
import deductiveTest1 from "../data/deductive-test1.json";
import { contexts as deductiveTest2Contexts, questions as deductiveTest2Questions } from "../data/deductive-test2";
import { contexts as deductiveTest3Contexts, questions as deductiveTest3Questions } from "../data/deductive-test3";
import { contexts as deductiveTest4Contexts, questions as deductiveTest4Questions } from "../data/deductive-test4";
import deductiveLogicalLst1 from "../data/deductive-logical-lst-1.json";

type LegacyOption = string | { id?: string; text?: string; label?: string; option?: string };
type LegacyQuestion = { id: string; testId?: string; number?: number; subquestion?: string | null; p?: string; s?: string; t?: string; o?: LegacyOption[]; a?: unknown; explanation?: string; sourceFile?: string; sourcePage?: number };
type ReferenceMaterial = { id: string; assetRef: string; label: string };
type DeductiveSourceQuestion = { id: string; testId: string; number: number; p: string; s: string; context: string; t: string; o: string[]; a: string; sourcePage: number; sourceFile: string };
type CompactDeductiveQuestion = [number, string, string[], string, number];

const CAPP_UNIQUE_CHARTS: ReferenceMaterial[] = [
  { id: "CAPP_CHART_1", assetRef: "ASSET_0001", label: "Annual salary" },
  { id: "CAPP_CHART_2", assetRef: "ASSET_0004", label: "Average property prices" },
  { id: "CAPP_CHART_3", assetRef: "ASSET_0007", label: "Coffee prices" },
  { id: "CAPP_CHART_4", assetRef: "ASSET_0010", label: "South American economies" },
];
function cappChartForQuestion(questionNumber: number): ReferenceMaterial { if (questionNumber <= 3) return CAPP_UNIQUE_CHARTS[0]; if (questionNumber <= 6) return CAPP_UNIQUE_CHARTS[1]; if (questionNumber <= 9) return CAPP_UNIQUE_CHARTS[2]; return CAPP_UNIQUE_CHARTS[3]; }

const DEDUCTIVE_REFERENCES: Record<string, ReferenceMaterial[]> = {
  TEST_030: [
    { id: "DED1_BROADBAND", assetRef: "TEST_030_BROADBAND.svg", label: "Broadband plans" },
    { id: "DED1_CONTRACTS", assetRef: "TEST_030_CONTRACTS.svg", label: "Salaries & contracts" },
  ],
  TEST_031: [
    { id: "DED2_CANALS", assetRef: "TEST_031_CANALS.svg", label: "Canals and Rivertrips" },
    { id: "DED2_JULIA", assetRef: "TEST_031_JULIA.svg", label: "Julia’s Requirements" },
  ],
  TEST_032: [
    { id: "DED3_FLIGHTS", assetRef: "TEST_032_FLIGHTS.svg", label: "Flights" },
    { id: "DED3_TAX", assetRef: "TEST_032_TAX.svg", label: "Council Tax Bands" },
  ],
  TEST_033: [
    { id: "DED4_LIBRARY", assetRef: "TEST_033_LIBRARY.svg", label: "Alphabetic Library" },
    { id: "DED4_FURNITURE", assetRef: "TEST_033_FURNITURE.svg", label: "Shops" },
  ],
};

export function referenceMaterialsForQuestion(testId: string, questionNumber: number): ReferenceMaterial[] {
  if (testId === "TEST_001" && questionNumber >= 1 && questionNumber <= 12) return [cappChartForQuestion(questionNumber)];
  if (testId === "TEST_002" && questionNumber <= 16) return [{ id: "DATA_P2", assetRef: "TEST_002_DATA_P2", label: "Data Set 1" }];
  if (testId === "TEST_002" && questionNumber <= 32) return [{ id: "DATA_P3", assetRef: "TEST_002_DATA_P3", label: "Data Set 2" }];
  if (testId === "TEST_002") return [{ id: "DATA_P4", assetRef: "TEST_002_DATA_P4", label: "Data Set 3" }];
  if (testId === "TEST_030" && (questionNumber === 5 || questionNumber === 6)) return [DEDUCTIVE_REFERENCES.TEST_030[0]];
  if (testId === "TEST_030" && (questionNumber === 17 || questionNumber === 18)) return [DEDUCTIVE_REFERENCES.TEST_030[1]];
  if (testId === "TEST_031" && (questionNumber === 5 || questionNumber === 6)) return [DEDUCTIVE_REFERENCES.TEST_031[0]];
  if (testId === "TEST_031" && (questionNumber === 17 || questionNumber === 18)) return [DEDUCTIVE_REFERENCES.TEST_031[1]];
  if (testId === "TEST_032" && (questionNumber === 5 || questionNumber === 6)) return [DEDUCTIVE_REFERENCES.TEST_032[0]];
  if (testId === "TEST_032" && (questionNumber === 17 || questionNumber === 18)) return [DEDUCTIVE_REFERENCES.TEST_032[1]];
  if (testId === "TEST_033" && (questionNumber === 5 || questionNumber === 6)) return [DEDUCTIVE_REFERENCES.TEST_033[0]];
  if (testId === "TEST_033" && (questionNumber === 17 || questionNumber === 18)) return [DEDUCTIVE_REFERENCES.TEST_033[1]];
  return [];
}

export function referenceMaterialsForTest(testId: string): ReferenceMaterial[] {
  if (testId === "TEST_001") return CAPP_UNIQUE_CHARTS;
  if (testId === "TEST_002") return [
    { id: "DATA_P2", assetRef: "TEST_002_DATA_P2", label: "Data Set 1" },
    { id: "DATA_P3", assetRef: "TEST_002_DATA_P3", label: "Data Set 2" },
    { id: "DATA_P4", assetRef: "TEST_002_DATA_P4", label: "Data Set 3" },
  ];
  return DEDUCTIVE_REFERENCES[testId] ?? [];
}

function legacyBlocks(value: unknown): ContentBlock[] { const text = String(value ?? "").trim(); return text ? [{ type: "text", value: text }] : []; }
function legacyBlock(value: unknown): ContentBlock { return { type: "text", value: String(value ?? "").trim() }; }
function optionText(option: LegacyOption): string { return String(typeof option === "string" ? option : option.text ?? option.label ?? option.option ?? option.id ?? "").trim(); }
function isTrueFalseCannotSay(text: string) { return /\btrue\s+false\s+cannot\s+say\b/i.test(text); }
function inferResponse(q: LegacyQuestion): CanonicalQuestion["response"] { const options = Array.isArray(q.o) ? q.o : []; const text = String(q.t ?? ""); if (isTrueFalseCannotSay(text)) return { type: "single_choice" }; if (/enter the answer|calculate|how many|what percentage|what was the total|how much would/i.test(text) && !options.length) return { type: "numeric" }; return options.length ? { type: "single_choice" } : { type: "text" }; }
function inferAnswer(q: LegacyQuestion, response: CanonicalQuestion["response"], options: { id: string; content: ContentBlock }[]): CanonicalQuestion["answer"] { const rawAnswer = String(q.a ?? "").trim(); const text = String(q.t ?? ""); if (response.type === "numeric") return { type: "numeric", value: rawAnswer }; if (isTrueFalseCannotSay(text)) { const answerMatch = String(q.explanation ?? "").match(/correct answer is\s+(true|false|cannot say)/i); return { type: "single", value: (answerMatch?.[1] ?? rawAnswer).trim().toLowerCase() }; } if (response.type === "text") return { type: "text", value: rawAnswer }; if (response.type === "multiple_choice") { const values = Array.isArray(q.a) ? q.a.map(String) : rawAnswer.split(/[,|]/).map(v => v.trim()).filter(Boolean); return { type: "multiple", values }; } const matchedOption = options.find(option => option.id.toLowerCase() === rawAnswer.toLowerCase()); return { type: "single", value: matchedOption?.id ?? rawAnswer }; }
function legacyQuestion(testId: string, q: LegacyQuestion): CanonicalQuestion { const rawOptions = Array.isArray(q.o) ? q.o : []; const response = inferResponse(q); const optionTexts = isTrueFalseCannotSay(String(q.t ?? "")) ? ["True", "False", "Cannot Say"] : rawOptions.map(optionText); const options = optionTexts.map((value, index) => ({ id: String.fromCharCode(65 + index), content: legacyBlock(value) })); const answer = inferAnswer(q, response, options); const mappedAnswer = response.type === "single_choice" ? (() => { const value = String(answer.type === "single" ? answer.value : "").trim().toLowerCase(); const match = options.find(option => option.content.type === "text" && option.content.value.trim().toLowerCase() === value); return match ? { type: "single" as const, value: match.id } : answer; })() : answer; return { id: `${testId}_${q.id}`, number: Number(q.number ?? 0), subquestion: q.subquestion ?? null, prompt: { blocks: legacyBlocks(q.t) }, options, response, answer: mappedAnswer, explanation: q.explanation ? { blocks: legacyBlocks(q.explanation) } : null, taxonomy: { pillar: q.p, subtype: q.s }, source: { legacyId: q.id, sourceFile: q.sourceFile, sourcePage: q.sourcePage, referenceMaterialIds: referenceMaterialsForQuestion(testId, Number(q.number ?? 0)).map(x => x.id) } }; }

function deductiveQuestion(q: DeductiveSourceQuestion): CanonicalQuestion { const options = q.o.map((value, index) => ({ id: String.fromCharCode(65 + index), content: legacyBlock(value) })); const sourceAnswer = q.number === 12 ? "The deal between the syndicate and William was to fund his parliament." : q.a; const answer = options.find(o => o.content.type === "text" && o.content.value === sourceAnswer)?.id ?? sourceAnswer; return { id: q.id, number: q.number, context: q.context, prompt: { blocks: legacyBlocks(q.t) }, options, response: { type: "single_choice" }, answer: { type: "single", value: answer }, taxonomy: { pillar: q.p, subtype: q.s }, source: { sourceFile: q.sourceFile, sourcePage: q.sourcePage, referenceMaterialIds: referenceMaterialsForQuestion("TEST_030", q.number).map(x => x.id), answerAudit: q.number === 12 ? "Corrected from source solution key after checking the stated premises; option B is the only demonstrably false statement." : undefined } }; }

function compactDeductiveTest(id: string, title: string, contexts: string[], rows: CompactDeductiveQuestion[]): CanonicalTest {
  return {
    id,
    title,
    taxonomy: { pillar: "deductive", subtype: "deductive_reasoning" },
    timing: { mode: "none" },
    questions: rows.map(([number, t, o, a, contextIndex]) => ({
      id: `${id}_Q${number}`,
      number,
      context: contexts[contextIndex],
      prompt: { blocks: legacyBlocks(t) },
      options: o.map((value, index) => ({ id: String.fromCharCode(65 + index), content: legacyBlock(value) })),
      response: { type: "single_choice" },
      answer: { type: "single", value: (() => { const idx = o.findIndex(value => value === a); return idx >= 0 ? String.fromCharCode(65 + idx) : a; })() },
      taxonomy: { pillar: "deductive", subtype: "deductive_reasoning" },
      source: { sourceFile: `${title}-Questions.pdf`, sourcePage: number, referenceMaterialIds: referenceMaterialsForQuestion(id, number).map(x => x.id) },
    })),
  };
}

function normalizeCanonicalTest(raw: unknown): CanonicalTest | null { if (!raw || typeof raw !== "object") return null; const test = raw as Partial<CanonicalTest>; if (typeof test.id !== "string" || !Array.isArray(test.questions)) return null; return { id: test.id, title: typeof test.title === "string" ? test.title : test.id, taxonomy: { pillar: String(test.taxonomy?.pillar ?? ""), subtype: test.taxonomy?.subtype ? String(test.taxonomy.subtype) : undefined }, timing: test.timing ?? { mode: "none" }, questions: test.questions.map((q) => ({ ...q, id: `${test.id}_${q.id}`, number: Number(q.number), subquestion: q.subquestion ?? null, options: Array.isArray(q.options) ? q.options : [], prompt: q.prompt ?? { blocks: [] } })) }; }

const canonicalOverrides = new Map<string, CanonicalTest>();
const test001 = normalizeCanonicalTest(canonicalTest001); if (test001) canonicalOverrides.set(test001.id, test001);
const deductiveLogicalLstTest = normalizeCanonicalTest(deductiveLogicalLst1); if (deductiveLogicalLstTest) canonicalOverrides.set("TEST_004", deductiveLogicalLstTest);
const deductiveTest: CanonicalTest = { id: "TEST_030", title: "DeductiveTest1", taxonomy: { pillar: "deductive", subtype: "deductive_reasoning" }, timing: { mode: "none" }, questions: (deductiveTest1 as DeductiveSourceQuestion[]).map(deductiveQuestion) }; canonicalOverrides.set("TEST_030", deductiveTest);
canonicalOverrides.set("TEST_031", compactDeductiveTest("TEST_031", "DeductiveTest2", deductiveTest2Contexts, deductiveTest2Questions as CompactDeductiveQuestion[]));
canonicalOverrides.set("TEST_032", compactDeductiveTest("TEST_032", "DeductiveTest3", deductiveTest3Contexts, deductiveTest3Questions as CompactDeductiveQuestion[]));
canonicalOverrides.set("TEST_033", compactDeductiveTest("TEST_033", "DeductiveTest4", deductiveTest4Contexts, deductiveTest4Questions as CompactDeductiveQuestion[]));

const grouped = new Map<string, LegacyQuestion[]>();
for (const rawQuestion of allQuestions as LegacyQuestion[]) { const id = String(rawQuestion.testId ?? rawQuestion.id.split("_")[0]); const list = grouped.get(id) ?? []; list.push(rawQuestion); grouped.set(id, list); }
const legacyTests: CanonicalTest[] = Array.from(grouped.entries()).map(([id, questions]) => { const catalogTest = appCatalog.tests.find(test => test.test_id === id); const first = questions[0]; return { id, title: catalogTest?.title ?? id, taxonomy: { pillar: String(first?.p ?? ""), subtype: first?.s ? String(first.s) : undefined }, timing: { mode: "none" }, questions: questions.map(q => legacyQuestion(id, q)) }; });
const legacyById = new Map(legacyTests.map(test => [test.id, test]));
export const canonicalTests: CanonicalTest[] = appCatalog.tests.map((catalogTest) => canonicalOverrides.get(catalogTest.test_id) ?? legacyById.get(catalogTest.test_id)).filter((test): test is CanonicalTest => Boolean(test));
export function questionsForEngine(testId: string): CanonicalQuestion[] { return canonicalTests.find(test => test.id === testId)?.questions ?? []; }
export function testForEngine(testId: string): CanonicalTest | null { return canonicalTests.find(test => test.id === testId) ?? null; }