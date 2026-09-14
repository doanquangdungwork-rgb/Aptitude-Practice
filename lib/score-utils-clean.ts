import {answersMatch} from "./canonical-engine";
import type {CanonicalQuestion} from "./canonical-engine";

export function isAnswered(value:unknown){
 if(value===undefined||value===null||value==="") return false;
 if(Array.isArray(value)) return value.length>0;
 if(typeof value==="object") return Object.keys(value as object).length>0;
 return true;
}

export function scoreQuestions(questions:CanonicalQuestion[],answers:Record<string,unknown>){
 let correct=0,answered=0;
 for(const q of questions){const value=answers[q.id];if(isAnswered(value)){answered++;if(answersMatch(q,value))correct++;}}
 return {correct,answered,wrong:answered-correct,unanswered:questions.length-answered,total:questions.length,accuracy:questions.length?Math.round(correct/questions.length*100):0};
}
