"use client";
import { useEffect, useState } from "react";
import type {CanonicalOption,CanonicalResponse,CanonicalAnswer} from "../lib/canonical-engine";
import {QuestionPrompt} from "./question-content";

export default function QuestionResponse({response,options,answer,value,onChange,screenshotMode=false}:{response:CanonicalResponse;options:CanonicalOption[];answer?:CanonicalAnswer;value:unknown;onChange:(value:unknown)=>void;screenshotMode?:boolean}){
 const selected=Array.isArray(value)?value.map(String):[];
 if(screenshotMode){
  return <div className="mt-8 grid gap-3">{options.map((o,i)=>{const id=o.id;const active=String(value??"")===id;return <button key={id} type="button" aria-pressed={active} onClick={()=>onChange(id)} className={`quiz-option text-left ${active?"selected":""}`}><span className="mr-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2f1eb] text-xs font-bold">{String.fromCharCode(65+i)}</span><span>{String.fromCharCode(65+i)}</span></button>})}</div>;
 }
 if(response.type==="ranking"){
  const current=value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,number>:{};
  const rankingItems=options.length?options.map(o=>({id:o.id,content:o.content})):answer?.type==="ranking"?Object.keys(answer.parts).map(id=>({id,content:{type:"text" as const,value:id}})):[];
  const rankCount=response.rankCount ?? rankingItems.length;
  return <div><div className="mt-8 grid gap-3">{rankingItems.map((o,i)=><label key={o.id} className="flex items-center gap-3 rounded-xl border border-[#e7e5de] bg-white p-3"><span className="font-bold">{String.fromCharCode(65+i)}.</span><span className="flex-1"><QuestionPrompt blocks={[o.content]}/></span><select aria-label={`Rank ${o.id}`} value={current[o.id]??""} onChange={e=>{const next={...current};if(e.target.value==="")delete next[o.id];else next[o.id]=Number(e.target.value);onChange(next)}} className="rounded-lg border border-[#dedbd2] bg-[#fbfaf6] px-3 py-2"><option value="">Rank</option>{Array.from({length:rankCount},(_,n)=><option key={n+1} value={n+1}>{n+1}</option>)}</select></label>)}</div></div>;
 }
 if(response.type==="numeric") return <input type="text" inputMode="decimal" value={value==null?"":String(value)} onChange={e=>onChange(e.target.value)} placeholder="Enter your answer…" className="mt-8 w-full rounded-xl border border-[#e7e5de] bg-white px-4 py-4 outline-none focus:border-[#222321]"/>;
 if(response.type==="text") return <input type="text" inputMode="text" value={value==null?"":String(value)} onChange={e=>onChange(e.target.value)} placeholder="Type your answer…" className="mt-8 w-full rounded-xl border border-[#e7e5de] bg-white px-4 py-4 outline-none focus:border-[#222321]"/>;
 if(response.type==="multiple_choice") return <div className="mt-8 grid gap-3">{options.map((o,i)=>{const active=selected.includes(o.id);return <button key={o.id} type="button" aria-pressed={active} onClick={()=>onChange(active?selected.filter(x=>x!==o.id):[...selected,o.id])} className={`quiz-option text-left ${active?"selected":""}`}><span className="mr-3 font-bold">{String.fromCharCode(65+i)}.</span><QuestionPrompt blocks={[o.content]}/></button>})}</div>;
 if(response.type==="composite") return <div className="mt-8 rounded-xl border border-[#e7e5de] bg-white p-4 text-sm text-[#77736b]">This question uses a composite response and is not yet supported.</div>;
 return <div className="mt-8 grid gap-3">{options.map((o,i)=><button key={o.id} type="button" aria-pressed={String(value??"")===o.id} onClick={()=>onChange(o.id)} className={`quiz-option text-left ${String(value??"")===o.id?"selected":""}`}><span className="mr-3 font-bold">{String.fromCharCode(65+i)}.</span><QuestionPrompt blocks={[o.content]}/></button>)}</div>;
}
