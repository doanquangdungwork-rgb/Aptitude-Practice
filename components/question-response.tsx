"use client";
import { useEffect, useState } from "react";
import type {CanonicalOption,CanonicalResponse,CanonicalAnswer} from "../lib/canonical-engine";
import {QuestionPrompt} from "./question-content";

function ScreenshotQuestion(){
 const [question,setQuestion]=useState<number|null>(null);
 useEffect(()=>{
  if(!window.location.pathname.includes("/tests/TEST_030")) return;
  const read=()=>{const text=document.querySelector(".quiz-top .text-sm.font-bold")?.textContent||"";const match=text.match(/Question\s+(\d+)/i);setQuestion(match?Number(match[1]):null)};
  const frame=requestAnimationFrame(read);return()=>cancelAnimationFrame(frame);
 },[]);
 if(!question) return null;
 return <div className="mb-8 overflow-auto rounded-2xl border border-[#e7e5de] bg-white"><img src={`/api/deductive-test1/question/${question}`} alt={`Deductive Reasoning Test 1 — Question ${question}`} className="block h-auto w-full object-contain" /></div>;
}

export default function QuestionResponse({response,options,answer,value,onChange}:{response:CanonicalResponse;options:CanonicalOption[];answer?:CanonicalAnswer;value:unknown;onChange:(value:unknown)=>void}){
 const selected=Array.isArray(value)?value.map(String):[];
 const screenshotMode=typeof window!=="undefined"&&window.location.pathname.includes("/tests/TEST_030");
 if(response.type==="ranking"){
  const current=value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,number>:{};
  const rankingItems=options.length?options.map(o=>({id:o.id,content:o.content})):answer?.type==="ranking"?Object.keys(answer.parts).map(id=>({id,content:{type:"text" as const,value:id}})):[];
  const rankCount=response.rankCount ?? rankingItems.length;
  return <div>{screenshotMode&&<ScreenshotQuestion/>}<div className="mt-8 grid gap-3">{rankingItems.map((o,i)=><label key={o.id} className="flex items-center gap-3 rounded-xl border border-[#e7e5de] bg-white p-3"><span className="font-bold">{String.fromCharCode(65+i)}.</span><span className="flex-1"><QuestionPrompt blocks={[o.content]}/></span><select aria-label={`Rank ${o.id}`} value={current[o.id]??""} onChange={e=>{const next={...current};if(e.target.value==="")delete next[o.id];else next[o.id]=Number(e.target.value);onChange(next)}} className="rounded-lg border border-[#dedbd2] bg-[#fbfaf6] px-3 py-2"><option value="">Rank</option>{Array.from({length:rankCount},(_,n)=><option key={n+1} value={n+1}>{n+1}</option>)}</select></label>)}</div></div>;
 }
 if(response.type==="numeric") return <div>{screenshotMode&&<ScreenshotQuestion/>}<input type="text" inputMode="decimal" value={value==null?"":String(value)} onChange={e=>onChange(e.target.value)} placeholder="Enter your answer…" className="mt-8 w-full rounded-xl border border-[#e7e5de] bg-white px-4 py-4 outline-none focus:border-[#222321]"/></div>;
 if(response.type==="text") return <div>{screenshotMode&&<ScreenshotQuestion/>}<input type="text" inputMode="text" value={value==null?"":String(value)} onChange={e=>onChange(e.target.value)} placeholder="Type your answer…" className="mt-8 w-full rounded-xl border border-[#e7e5de] bg-white px-4 py-4 outline-none focus:border-[#222321]"/></div>;
 if(response.type==="multiple_choice") return <div>{screenshotMode&&<ScreenshotQuestion/>}<div className="mt-8 grid gap-3">{options.map((o,i)=>{const active=selected.includes(o.id);return <button key={o.id} type="button" aria-pressed={active} onClick={()=>onChange(active?selected.filter(x=>x!==o.id):[...selected,o.id])} className={`quiz-option text-left ${active?"selected":""}`}><span className="mr-3 font-bold">{String.fromCharCode(65+i)}.</span><QuestionPrompt blocks={[o.content]}/></button>})}</div></div>;
 if(response.type==="composite") return <div>{screenshotMode&&<ScreenshotQuestion/>}<div className="mt-8 rounded-xl border border-[#e7e5de] bg-white p-4 text-sm text-[#77736b]">This question uses a composite response and is not yet supported.</div></div>;
 return <div>{screenshotMode&&<ScreenshotQuestion/>}<div className="mt-8 grid gap-3">{options.map((o,i)=><button key={o.id} type="button" aria-pressed={String(value??"")===o.id} onClick={()=>onChange(o.id)} className={`quiz-option text-left ${String(value??"")===o.id?"selected":""}`}><span className="mr-3 font-bold">{String.fromCharCode(65+i)}.</span><QuestionPrompt blocks={[o.content]}/></button>)}</div></div>;
}
