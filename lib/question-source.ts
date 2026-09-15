import { allQuestions, appCatalog } from "./data";
import type { CanonicalQuestion, CanonicalTest, ContentBlock } from "./canonical-engine";

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

function legacyBlocks(value: unknown): ContentBlock[] {
  const text = String(value ?? "").trim();
  return text ? [{ type: "text", value: text }] : [];
}

function legacyBlock(value: unknown): ContentBlock {
  return { type: "text", value: String(value ?? "").trim() };
}

function optionText(option: LegacyOption): string {
  return String(typeof option === "string" ? option : option.text ?? option.label ?? option.option ?? option.id ?? "").trim();
}

function inferResponse(q: LegacyQuestion): CanonicalQuestion["response"] {
  const options = Array.isArray(q.o) ? q.o : [];
  const text = String(q.t ?? "");
  if (/\btrue\s+false\s+cannot\s+say\b/i.test(text)) return { type: "single_choice" };
  if (/enter the answer|calculate|how many|what percentage|what was the total|how much would/i.test(text) && !options.length) return { type: "numeric" };
  return options.length ? { type: "single_choice" } : { type: "text" };
}

function inferAnswer(q: LegacyQuestion, response: CanonicalQuestion["response"], options: { id: string; content: ContentBlock }[]): CanonicalQuestion["answer"] {
  const rawAnswer = String(q.a ?? "").trim();
  const text = String(q.t ?? "");
  const explanation = String(q.explanation ?? "");
  if (response.type === "numeric") return { type: "numeric", value: rawAnswer };
  const tfMatch = text.match(/\b(True|False|Cannot Say)\s*$/i);
  if (tfMatch) {
    const answerMatch = explanation.match(/correct answer is\s+(true|false|cannot say)/i);
    return { type: "single", value: (answerMatch?.[1] ?? rawAnswer).trim().toLowerCase() };
  }
  const matchedOption = options.find(option => option.id.toLowerCase() === rawAnswer.toLowerCase());
  return { type: "single", value: matchedOption?.id ?? rawAnswer };
}

function legacyQuestion(testId: string, q: LegacyQuestion): CanonicalQuestion {
  const rawOptions = Array.isArray(q.o) ? q.o : [];
  const response = inferResponse(q);
  const optionTexts = /\btrue\s+false\s+cannot\s+say\b/i.test(String(q.t ?? "")) ? ["True", "False", "Cannot Say"] : rawOptions.map(optionText);
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
    source: { legacyId: q.id, sourceFile: q.sourceFile, sourcePage: q.sourcePage },
  };
}

const grouped = new Map<string, LegacyQuestion[]>();
for (const rawQuestion of allQuestions as LegacyQuestion[]) {
  const id = String(rawQuestion.testId ?? rawQuestion.id.split("_")[0]);
  const list = grouped.get(id) ?? [];
  list.push(rawQuestion);
  grouped.set(id, list);
}

export const canonicalTests: CanonicalTest[] = Array.from(grouped.entries()).map(([id, questions]) => {
  const catalogTest = appCatalog.tests.find(test => test.test_id === id);
  const first = questions[0];
  return {
    id,
    title: catalogTest?.title ?? id,
    taxonomy: { pillar: String(first?.p ?? ""), subtype: first?.s ? String(first.s) : undefined },
    timing: { mode: "none" },
    questions: questions.map(q => legacyQuestion(id, q)),
  };
});

export function questionsForEngine(testId: string): CanonicalQuestion[] {
  return canonicalTests.find(test => test.id === testId)?.questions ?? [];
}

export function testForEngine(testId: string): CanonicalTest | null {
  return canonicalTests.find(test => test.id === testId) ?? null;
}
