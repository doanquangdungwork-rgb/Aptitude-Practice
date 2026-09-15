"use client";
import {useState} from "react";
import type {CanonicalQuestion} from "../lib/canonical-engine";
import {answersMatch} from "../lib/canonical-engine";
import {QuestionPrompt} from "./question-content";
import QuestionResponse from "./question-response";

export default function CanonicalTestRunner({questions}:{questions:CanonicalQuestion[]}){
 const [index,setIndex]=useState(0); const [answers,setAnswers]=useState<Record<string,unknown>>({});
 const q=questions[index]; const value=q?answers[q.id]:undefined;
 const correct=q?answersMatch(q,value):false;
 const answered=value!==undefined&&value!==""&&(Array.isArray(value)?value.length>0:true);
 const setValue=(next:unknown)=>q&&setAnswers(prev=>({...prev,[q.id]:next}));
 if(!q)return <div className="quiz-card">No questions available.</div>;
 return <div className="quiz-shell">
  <div className="quiz-top"><div><div className="text-sm font-bold">Question {q.number}{q.subquestion||""} <span className="font-normal text-[#aaa7a0]">/ {questions.length}</span></div><div className="mt-1 text-xs text-[#aaa7a0]">{q.taxonomy?.pillar||"Reasoning"}</div></div></div>
  <div className="quiz-progress"><span style={{width:`${((index+1)/questions.length)*100}%`}}/></div>
  <article className="quiz-card mt-6"><QuestionPrompt blocks={q.prompt.blocks}/><QuestionResponse response={q.response} options={q.options} value={value} onChange={setValue}/></article>
  <div className="quiz-nav"><button disabled={!index} onClick={()=>setIndex(index-1)} className="outline-action disabled:opacity-30">Previous</button><span className="text-xs text-[#aaa7a0]">{answered?"Answer saved":"Not answered"}</span>{index<questions.length-1?<button onClick={()=>setIndex(index+1)} className="yellow-button">Next →</button>:<span className={`text-xs font-bold ${correct?"text-[#46734b]":"text-[#8a5d51]"}`}>{answered?(correct?"Matches answer key":"Does not match answer key"):"Skipped"}</span>}</div>
 </div>;
}
