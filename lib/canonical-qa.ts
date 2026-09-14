import type {CanonicalQuestion} from "./canonical-engine";

export type QaIssue={questionId:string;kind:"source-answer"|"missing-options"|"visual";note:string};

export function answerNeedsReview(question:CanonicalQuestion){
 const value=question.answer.type==="single"||question.answer.type==="text"?String(question.answer.value):"";
 return /Copyright AssessmentDay|Page \d+ of \d+|https?:\/\//i.test(value);
}

export function canonicalQa(question:CanonicalQuestion):QaIssue[]{
 const issues:QaIssue[]=[];
 if(answerNeedsReview(question)) issues.push({questionId:question.id,kind:"source-answer",note:"Answer contains source footer text and needs cleaning."});
 if(question.response.type==="single_choice"&&!question.options.length) issues.push({questionId:question.id,kind:"missing-options",note:"No explicit option list; render as free-text answer unless options are later extracted."});
 if(question.prompt.blocks.some(block=>block.type==="image")) issues.push({questionId:question.id,kind:"visual",note:"Question depends on a visual asset."});
 return issues;
}
