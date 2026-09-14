"use client";
import type {CanonicalOption,CanonicalResponse} from "../lib/canonical-engine";
import QuestionContent from "./question-content";

export default function QuestionResponse({response,options,value,onChange}:{response:CanonicalResponse;options:CanonicalOption[];value:unknown;onChange:(value:unknown)=>void}){
 const selected=Array.isArray(value)?value.map(String):[];
 if(response.type==="ranking"){
  const current=value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,number>:{};
  return <div className="mt-8 grid gap-3">{options.map((o,i)=><label key={o.id} className="flex items-center gap-3 rounded-xl border border-[#e7e5de] bg-white p-3"><span className="font-bold">{String.fromCharCode(65+i)}.</span><span className="flex-1"><QuestionContent blocks={[o.content]}/></span><select value={current[o.id]??""} onChange={e=>onChange({...current,[o.id]:Number(e.target.value)})} className="rounded-lg border border-[#dedbd2] bg-[#fbfaf6] px-3 py-2"><option value="">Rank</option>{options.map((_,n)=><option key={n+1} value={n+1}>{n+1}</option>)}</select></label>)}</div>;
 }
 if(response.type==="numeric" || response.type==="text" || !options.length) return <input type="text" inputMode={response.type==="numeric"?"decimal":"text"} value={value==null?"":String(value)} onChange={e=>onChange(e.target.value)} placeholder={response.type==="numeric"?"Enter your answer…":"Type your answer…"} className="mt-8 w-full rounded-xl border border-[#e7e5de] bg-white px-4 py-4 outline-none focus:border-[#222321]"/>;
 if(response.type==="multiple_choice") return <div className="mt-8 grid gap-3">{options.map((o,i)=>{const active=selected.includes(o.id);return <button key={o.id} type="button" onClick={()=>onChange(active?selected.filter(x=>x!==o.id):[...selected,o.id])} className={`quiz-option text-left ${active?"selected":""}`}><span className="mr-3 font-bold">{String.fromCharCode(65+i)}.</span><QuestionContent blocks={[o.content]}/></button>})}</div>;
 return <div className="mt-8 grid gap-3">{options.map((o,i)=><button key={o.id} type="button" onClick={()=>onChange(o.id)} className={`quiz-option text-left ${String(value??"")===o.id?"selected":""}`}><span className="mr-3 font-bold">{String.fromCharCode(65+i)}.</span><QuestionContent blocks={[o.content]}/></button>)}</div>;
}
