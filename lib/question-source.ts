import { allQuestions, questionsForTest } from "./data";
import type { CanonicalQuestion, CanonicalTest, ContentBlock } from "./canonical-engine";

export const canonicalTests: CanonicalTest[] = [];

function legacyBlocks(value: unknown): ContentBlock[] {
  const text = String(value ?? "").trim();
  return text ? [{ type: "text", value: text }] : [];
}

function legacyQuestion(testId: string, q: any): CanonicalQuestion {
  const options = Array.isArray(q.o) ? q.o : [];
  return {
    id: `${testId}_${q.id}`,
    number: Number(q.number ?? 0),
    subquestion: q.subquestion ?? null,
    prompt: { blocks: legacyBlocks(q.t) },
    options: options.map((option: any, index: number) => ({
      id: String(typeof option === "string" ? option : option.id ?? option.label ?? String.fromCharCode(65 + index)),
      content: legacyBlocks(typeof option === "string" ? option : option.text ?? option.label ?? option.option),
    })),
    response: { type: options.length ? "single_choice" : "text" },
    answer: { type: "single", value: String(q.a ?? "") },
    explanation: q.explanation ? String(q.explanation) : null,
    taxonomy: { pillar: q.p, subtype: q.s },
    source: { legacyId: q.id, sourceFile: q.sourceFile, sourcePage: q.sourcePage },
  };
}

export function questionsForEngine(testId: string): CanonicalQuestion[] {
  const canonical = canonicalTests.find(test => test.id === testId);
  if (canonical?.questions?.length) return canonical.questions;
  return allQuestions.filter((q: any) => q.testId === testId || q.id.startsWith(testId + "_"))
    .map((q: any) => legacyQuestion(testId, q));
}

export function testForEngine(testId: string): CanonicalTest | null {
  const canonical = canonicalTests.find(test => test.id === testId);
  if (canonical) return canonical;
  const legacy = questionsForTest(testId);
  if (!legacy.length) return null;
  const first: any = legacy[0];
  return {
    id: testId,
    title: testId,
    taxonomy: { pillar: first.p, subtype: first.s },
    questions: legacy.map((q: any) => legacyQuestion(testId, q)),
  };
}
