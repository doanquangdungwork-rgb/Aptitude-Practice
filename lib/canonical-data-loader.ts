import type {CanonicalDataset,CanonicalTest} from "./canonical-engine";

export function normalizeCanonicalDataset(input:CanonicalDataset):CanonicalDataset{
 return {...input,tests:input.tests.map((test:CanonicalTest)=>({...test,questions:test.questions.map(question=>({...question,options:question.options??[],taxonomy:question.taxonomy??test.taxonomy}))}))};
}
