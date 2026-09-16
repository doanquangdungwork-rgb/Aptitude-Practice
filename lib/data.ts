import questions from "../data/questions.json";
import deductiveTest1 from "../data/deductive-test1.json";
import catalog from "../data/catalog.json";

export type Question = (typeof questions)[number] | (typeof deductiveTest1)[number];
export type Catalog = typeof catalog;

const baseQuestions = questions as Question[];
const test030Questions = deductiveTest1 as Question[];
export const allQuestions = [...baseQuestions.filter((q: any) => q.testId !== "TEST_030"), ...test030Questions];
export const appCatalog = catalog as Catalog;

export const pillarMap: Record<string, string> = {
  deductive: "Deductive Reasoning",
  logical: "Logical Reasoning",
  diagrammatic: "Diagrammatic Reasoning",
  numerical: "Numerical Reasoning",
  verbal: "Verbal Reasoning",
  situational_judgement: "Situational Judgement",
};

export function questionsForTest(testId: string) {
  return allQuestions.filter((q: any) => q.testId === testId || q.id.startsWith(testId + "_"));
}

export function questionsForPillar(pillar: string, subtype?: string) {
  return allQuestions.filter((q: any) => q.p === pillar && (!subtype || q.s === subtype));
}
