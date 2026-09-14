import { allQuestions, questionsForTest } from "./data";
import type { CanonicalQuestion, CanonicalTest, ContentBlock } from "./canonical-engine";

export const canonicalTests: CanonicalTest[] = [];

function legacyBlocks(value: unknown): ContentBlock[] {
  const text = String(value ?? "").trim();
  return text ? [{ type: "text", value: text }] : [];
}

function legacyQuestion(testId: string, q: any): CanonicalQuestion {
  const rawOptions = Array.isArray(q.o) ? q.o : [];
  const responseType = rawOptions.length ? "single_choice" : "text";
  return {
    id: `${testId}_${q.id}`,
    number: Number(q.number ?? 0),
    subquestion: q.subquestion ?? null,
    prompt: { blocks: legacyBlocks(q.t) },
    options: rawOptions.map((option: any, index: number) => ({
      id: String(typeof option === "string" ? option : option.id ?? option.label ?? String.fromCharCode(65 + index)),
      content: legacyBlocks(typeof option === "string" ? option : option.text ?? option.label ?? option.option),
    })),
    response: { type: responseType },
    answer: { type: "single", value: String(q.a ?? "") },
    explanation: q.explanation ? { blocks: legacyBlocks(q.explanation) } : null,
    taxonomy: { pillar: q.p, subtype: q.s },
    source: { legacyId: q.id, sourceFile: q.sourceFile, sourcePage: q.sourcePage },
  };
}

function normalizeCanonicalQuestion(testId: string, q: CanonicalQuestion): CanonicalQuestion {
  if (q.id.startsWith(`${testId}_`)) return q;
  const options = q.response.type === "ranking" && q.options.length === 0 && q.answer.type === "ranking"
    ? Object.keys(q.answer.parts).map(id => ({ id, content: { type: "text" as const, value: id } }))
    : q.options;
  return { ...q, id: `${testId}_${q.id}`, options };
}

export function questionsForEngine(testId: string): CanonicalQuestion[] {
  const canonical = canonicalTests.find(test => test.id === testId);
  if (canonical?.questions?.length) return canonical.questions.map(q => normalizeCanonicalQuestion(testId, q));
  return allQuestions.filter((q: any) => q.testId === testId || q.id.startsWith(testId + "_")).map((q: any) => legacyQuestion(testId, q));
}

export function testForEngine(testId: string): CanonicalTest | null {
  const canonical = canonicalTests.find(test => test.id === testId);
  if (canonical) return { ...canonical, questions: questionsForEngine(testId) };
  const legacy = questionsForEngine(testId);
  if (!legacy.length) return null;
  const first = legacy[0];
  return { id: testId, title: testId, taxonomy: { pillar: first.taxonomy?.pillar || "", subtype: first.taxonomy?.subtype }, questions: legacy };
}
