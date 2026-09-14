import {answersMatch} from "./canonical-engine";
import type {CanonicalQuestion} from "./canonical-engine";

export function assertCanonicalScoring(question:CanonicalQuestion,selected:unknown){
 return answersMatch(question,selected);
}
