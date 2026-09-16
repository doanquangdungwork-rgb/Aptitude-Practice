import questions from "../data/questions.json";
import deductiveTest1 from "../data/deductive-test1.json";
import { questions as deductiveTest2 } from "../data/deductive-test2";
import { questions as deductiveTest3 } from "../data/deductive-test3";
import { questions as deductiveTest4 } from "../data/deductive-test4";
import catalog from "../data/catalog.json";

export type Question = (typeof questions)[number] | (typeof deductiveTest1)[number] | (typeof deductiveTest2)[number] | (typeof deductiveTest3)[number] | (typeof deductiveTest4)[number];
export type Catalog = typeof catalog;

const baseQuestions = questions as Question[];
const test030Questions = deductiveTest1 as Question[];
const test031Questions = deductiveTest2.map(([number, t, o, a]) => ({ id: `TEST_031_Q${number}`, testId: "TEST_031", number, p: "deductive", s: "deductive_reasoning", t, o, a } as Question));
const test032Questions = deductiveTest3.map(([number, t, o, a]) => ({ id: `TEST_032_Q${number}`, testId: "TEST_032", number, p: "deductive", s: "deductive_reasoning", t, o, a } as Question));
const test033Questions = deductiveTest4.map(([number, t, o, a]) => ({ id: `TEST_033_Q${number}`, testId: "TEST_033", number, p: "deductive", s: "deductive_reasoning", t, o, a } as Question));
export const allQuestions = [...baseQuestions.filter((q: any) => !["TEST_030", "TEST_031", "TEST_032", "TEST_033"].includes(q.testId)), ...test030Questions, ...test031Questions, ...test032Questions, ...test033Questions];
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
