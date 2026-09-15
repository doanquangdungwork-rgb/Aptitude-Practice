import { allQuestions } from "./data";
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

function inferResponse(q: LegacyQuestion): CanonicalQuestion["response"] {
  const options = Array.isArray(q.o) ? q.o : [];
  if (/enter the answer|calculate|how many|what percentage|what was the total|how much would/i.test(String(q.t ?? "")) && !options.length) return { type: "numeric" };
  return options.length ? { type: "single_choice" } : { type: "text" };
}

function optionText(option: LegacyOption): string {
  return String(typeof option === "string" ? option : option.text ?? option.label ?? option.option ?? option.id ?? "").trim();
}

function legacyQuestion(testId: string, q: LegacyQuestion): CanonicalQuestion {
  const rawOptions = Array.isArray(q.o) ? q.o : [];
  const response = inferResponse(q);
  const options = rawOptions.map((option: LegacyOption, index: number) => ({
    id: String(typeof option === "string" ? String.fromCharCode(65 + index) : option.id ?? option.label ?? String.fromCharCode(65 + index)),
    content: legacyBlocks(optionText(option)),
  }));
  const rawAnswer = String(q.a ?? "").trim();
  const matchedOption = options.find((option: { id: string; content: ContentBlock[] }, index: number) =>
    option.id.toLowerCase() === rawAnswer.toLowerCase() || optionText(rawOptions[index]).toLowerCase() === rawAnswer.toLowerCase()
  );
  const answerValue = matchedOption?.id ?? rawAnswer;
  return {
    id: `${testId}_${q.id}`,
    number: Number(q.number ?? 0),
    subquestion: q.subquestion ?? null,
    prompt: { blocks: legacyBlocks(q.t) },
    options,
    response,
    answer: { type: response.type === "numeric" ? "numeric" : response.type === "single_choice" ? "single" : "text", value: answerValue },
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
  const first = questions[0];
  return {
    id,
    title: id,
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
