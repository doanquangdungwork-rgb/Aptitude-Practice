import { allQuestions, appCatalog } from "./data";
import type { CanonicalQuestion, CanonicalTest, ContentBlock } from "./canonical-engine";
import canonicalTest001 from "../data/canonical/TEST_001.json";

type LegacyOption = string | { id?: string; text?: string; label?: string; option?: string };
type LegacyQuestion = {
  id: string;
  testId?: string;
  number?: number;
  subquestion?: string | null;
  p?: string;
  s?: string;
  t?: string;
  o?: LegacyOption[];
  a?: unknown;
  explanation?: string;
  sourceFile?: string;
  sourcePage?: number;
};

type ReferenceMaterial = { id: string; assetRef: string; label: string };

export function referenceMaterialsForQuestion(testId: string, questionNumber: number): ReferenceMaterial[] {
  if (testId !== "TEST_002") return [];
  if (questionNumber <= 16) return [{ id: "DATA_P2", assetRef: "TEST_002_DATA_P2", label: "Data Set 1" }];
  if (questionNumber <= 32) return [{ id: "DATA_P3", assetRef: "TEST_002_DATA_P3", label: "Data Set 2" }];
  return [{ id: "DATA_P4", assetRef: "TEST_002_DATA_P4", label: "Data Set 3" }];
}

export function referenceMaterialsForTest(testId: string): ReferenceMaterial[] {
  if (testId !== "TEST_002") return [];
  return [
    { id: "DATA_P2", assetRef: "TEST_002_DATA_P2", label: "Data Set 1" },
    { id: "DATA_P3", assetRef: "TEST_002_DATA_P3", label: "Data Set 2" },
    { id: "DATA_P4", assetRef: "TEST_002_DATA_P4", label: "Data Set 3" },
  ];
}

function legacyBlocks(value: unknown): ContentBlock[] {
  const text = String(value ?? "").trim();
  return text ? [{ type: "text", value: text }] : [];
}

function legacyBlock(value: unknown): ContentBlock { return { type: "text", value: String(value ?? "").trim() }; }

function optionText(option: LegacyOption): string {
  return String(typeof option === "string" ? option : option.text ?? option.label ?? option.option ?? option.id ?? "").trim();
}

function isTrueFalseCannotSay(text: string) { return /\btrue\s+false\s+cannot\s+say\b/i.test(text); }

function inferResponse(q: LegacyQuestion): CanonicalQuestion["response"] {
  const options = Array.isArray(q.o) ? q.o : [];
  const text = String(q.t ?? "");
  if (isTrueFalseCannotSay(text)) return { type: "single_choice" };
  if (/enter the answer|calculate|how many|what percentage|what was the total|how much would/i.test(text) && !options.length) return { type: "numeric" };
  return options.length ? { type: "single_choice" } : { type: "text" };
}

function inferAnswer(q: LegacyQuestion, response: CanonicalQuestion["response"], options: { id: string; content: ContentBlock }[]): CanonicalQuestion["answer"] {
  const raw = q.a;
  const rawAnswer = String(raw ?? "").trim();
  const text = String(q.t ?? "");
  const explanation = String(q.explanation ?? "");
  if (response.type === "numeric") return { type: "numeric", value: rawAnswer };
  if (isTrueFalseCannotSay(text)) {
    const answerMatch = explanation.match(/correct answer is\s+(true|false|cannot say)/i);
    return { type: "single", value: (answerMatch?.[1] ?? rawAnswer).trim().toLowerCase() };
  }
  if (response.type === "text") return { type: "text", value: rawAnswer };
  if (response.type === "multiple_choice") {
    const values = Array.isArray(raw) ? raw.map(String) : rawAnswer.split(/[,|]/).map(v => v.trim()).filter(Boolean);
    return { type: "multiple", values };
  }
  const matchedOption = options.find(option => option.id.toLowerCase() === rawAnswer.toLowerCase());
  return { type: "single", value: matchedOption?.id ?? rawAnswer };
}

function legacyQuestion(testId: string, q: LegacyQuestion): CanonicalQuestion {
  const rawOptions = Array.isArray(q.o) ? q.o : [];
  const response = inferResponse(q);
  const optionTexts = isTrueFalseCannotSay(String(q.t ?? "")) ? ["True", "False", "Cannot Say"] : rawOptions.map(optionText);
  const options = optionTexts.map((value, index) => ({ id: String.fromCharCode(65 + index), content: legacyBlock(value) }));
  const answer = inferAnswer(q, response, options);
  const mappedAnswer = response.type === "single_choice" ? (() => {
    const value = String(answer.type === "single" ? answer.value : "").trim().toLowerCase();
    const match = options.find(option => option.content.type === "text" && option.content.value.trim().toLowerCase() === value);
    return match ? { type: "single" as const, value: match.id } : answer;
  })() : answer;
  return {
    id: `${testId}_${q.id}`,
    number: Number(q.number ?? 0),
    subquestion: q.subquestion ?? null,
    prompt: { blocks: legacyBlocks(q.t) },
    options,
    response,
    answer: mappedAnswer,
    explanation: q.explanation ? { blocks: legacyBlocks(q.explanation) } : null,
    taxonomy: { pillar: q.p, subtype: q.s },
    source: { legacyId: q.id, sourceFile: q.sourceFile, sourcePage: q.sourcePage, referenceMaterialIds: referenceMaterialsForQuestion(testId, Number(q.number ?? 0)).map(x => x.id) },
  };
}

function normalizeCanonicalTest(raw: unknown): CanonicalTest | null {
  if (!raw || typeof raw !== "object") return null;
  const test = raw as Partial<CanonicalTest>;
  if (typeof test.id !== "string" || !Array.isArray(test.questions)) return null;
  return { id: test.id, title: typeof test.title === "string" ? test.title : test.id, taxonomy: { pillar: String(test.taxonomy?.pillar ?? ""), subtype: test.taxonomy?.subtype ? String(test.taxonomy.subtype) : undefined }, timing: test.timing ?? { mode: "none" }, questions: test.questions.map((q) => ({ ...q, id: `${test.id}_${q.id}`, number: Number(q.number), subquestion: q.subquestion ?? null, options: Array.isArray(q.options) ? q.options : [], prompt: q.prompt ?? { blocks: [] } })) };
}

const canonicalOverrides = new Map<string, CanonicalTest>();
const test001 = normalizeCanonicalTest(canonicalTest001);
if (test001) canonicalOverrides.set(test001.id, test001);

const grouped = new Map<string, LegacyQuestion[]>();
for (const rawQuestion of allQuestions as LegacyQuestion[]) {
  const id = String(rawQuestion.testId ?? rawQuestion.id.split("_")[0]);
  const list = grouped.get(id) ?? [];
  list.push(rawQuestion);
  grouped.set(id, list);
}

const legacyTests: CanonicalTest[] = Array.from(grouped.entries()).map(([id, questions]) => {
  const catalogTest = appCatalog.tests.find(test => test.test_id === id);
  const first = questions[0];
  return { id, title: catalogTest?.title ?? id, taxonomy: { pillar: String(first?.p ?? ""), subtype: first?.s ? String(first.s) : undefined }, timing: { mode: "none" }, questions: questions.map(q => legacyQuestion(id, q)) };
});

const legacyById = new Map(legacyTests.map(test => [test.id, test]));
export const canonicalTests: CanonicalTest[] = appCatalog.tests.map((catalogTest) => canonicalOverrides.get(catalogTest.test_id) ?? legacyById.get(catalogTest.test_id)).filter((test): test is CanonicalTest => Boolean(test));
export function questionsForEngine(testId: string): CanonicalQuestion[] { return canonicalTests.find(test => test.id === testId)?.questions ?? []; }
export function testForEngine(testId: string): CanonicalTest | null { return canonicalTests.find(test => test.id === testId) ?? null; }
