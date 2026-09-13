import questions from "@/data/questions.json"; import catalog from "@/data/catalog.json";
export type Question=typeof questions[number]; export type Catalog=typeof catalog; export const allQuestions=questions as Question[]; export const appCatalog=catalog as Catalog;
export const pillarMap:Record<string,string>={deductive:"Deductive Reasoning",logical:"Logical Reasoning",diagrammatic:"Diagrammatic Reasoning",numerical:"Numerical Reasoning",verbal:"Verbal Reasoning",situational_judgement:"Situational Judgement"};
export function questionsForTest(testId:string){return allQuestions.filter(q=>q.id.startsWith(testId+"_"))}
export function questionsForPillar(pillar:string,subtype?:string){return allQuestions.filter(q=>q.p===pillar&&(!subtype||q.s===subtype))}
