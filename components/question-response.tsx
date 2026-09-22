"use client";
import type {CanonicalOption,CanonicalResponse,CanonicalAnswer} from "../lib/canonical-engine";
import {QuestionPrompt} from "./question-content";

export default function QuestionResponse({response,options,answer,value,onChange,screenshotMode=false}:{response:CanonicalResponse;options:CanonicalOption[];answer?:CanonicalAnswer;value:unknown;onChange:(value:unknown)=>void;screenshotMode?:boolean}){
 const selected=Array.isArray(value)?value.map(String):[];
 const optionLabel=(i:number)=>String.fromCharCode(65+i);
 const isFigureOption=(o:CanonicalOption)=>{
  if(o.content.type!=="text") return false;
  const text=(o.content as {type:"text";value:string}).value;
  return /^Figure \d+$/i.test(text.trim());
 };
 const optionDisplay=(o:CanonicalOption,i:number)=>{
  if(screenshotMode) return optionLabel(i);
  return isFigureOption(o)?((o.content as {type:"text";value:string}).value):o.id;
 };
 const labelContent=(o:CanonicalOption,i:number)=>{
  if(screenshotMode) return null;
  // The circular badge already displays the option label (A, B, C...).
  // Some imported data stores that same label as the option text, so hide
  // the redundant second label while preserving real answer text.
  if(o.content.type==="text"){
   const text=(o.content as {type:"text";value:string}).value.trim();
   const label=optionLabel(i);
   if(new RegExp(`^\\(?${label}\\)?[.:]?$\`, "i").test(text)) return null;
  }
  return <QuestionPrompt blocks={[o.content]}/>;
 };

 if(response.type==="ranking"){
  const current=value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,number>:{};
  const rankingItems=options.length?options:answer?.type==="ranking"?Object.keys(answer.parts).map(id=>({id,content:{type:"text" as const,value:id}})):[];
  const rankCount=response.rankCount ?? rankingItems.length;
  return <div className="mt-8 grid gap-3">{rankingItems.map((o,i)=><label key={o.id} className="flex items-center gap-3 rounded-xl border border-[#e7e5de] bg-white p-3"><span className="font-bold">{optionLabel(i)}.</span><span className="flex-1">{labelContent(o,i)}</span><select aria-label={`Rank ${o.id}`} value={current[o.id]??""} onChange={e=>{const next={...current};if(e.target.value==="")delete next[o.id];else next[o.id]=Number(e.target.value);onChange(next)}} className="rounded-lg border border-[#dedbd2] bg-[#fbfaf6] px-3 py-2"><option value="">Rank</option>{Array.from({length:rankCount},(_,n)=><option key={n+1} value={n+1}>{n+1}</option>)}</select></label>)}</div>;
 }
 if(response.type==="numeric") return <input type="text" inputMode="decimal" value={value==null?"":String(value)} onChange={e=>onChange(e.target.value)} placeholder="Enter your answer…" className="mt-8 w-full rounded-xl border border-[#e7e5de] bg-white px-4 py-4 outline-none focus:border-[#222321]"/>;
 if(response.type==="text") return <input type="text" inputMode="text" value={value==null?"":String(value)} onChange={e=>onChange(e.target.value)} placeholder="Type your answer…" className="mt-8 w-full rounded-xl border border-[#e7e5de] bg-white px-4 py-4 outline-none focus:border-[#222321]"/>;
 if(response.type==="composite"){
  const current=value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
  const setPart=(part:string,id:string)=>onChange({...current,[part]:id});
  return <div className="mt-8 grid gap-6">
   {["most","least"].map(part=><div key={part}><div className="mb-2 text-sm font-bold capitalize">{part} likely</div><div className="grid gap-3">{options.map((o,i)=><button key={o.id} type="button" aria-pressed={String(current[part]??"")===o.id} onClick={()=>setPart(part,o.id)} className={`quiz-option text-left ${String(current[part]??"")===o.id?"selected":""}`}><span className="mr-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2f1eb] text-xs font-bold">{optionLabel(i)}</span>{labelContent(o,i)}</button>)}</div></div>)}
  </div>;
 }
 if(response.type==="multiple_choice") return <div className="mt-8 grid gap-3">{options.map((o,i)=>{const active=selected.includes(o.id);return <button key={o.id} type="button" aria-pressed={active} onClick={()=>onChange(active?selected.filter(x=>x!==o.id):[...selected,o.id])} className={`quiz-option text-left ${active?"selected":""}`}><span className="mr-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2f1eb] text-xs font-bold">{optionDisplay(o,i)}</span>{labelContent(o,i)}</button>})}</div>;
 return <div className="mt-8 grid gap-3">{options.map((o,i)=>{const active=String(value??"")===o.id;return <button key={o.id} type="button" aria-pressed={active} onClick={()=>onChange(o.id)} className={`quiz-option text-left ${active?"selected":""}`}><span className="mr-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2f1eb] text-xs font-bold">{optionLabel(i)}</span>{labelContent(o,i)}</button>})}</div>;
}
