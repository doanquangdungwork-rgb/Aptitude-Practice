"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { appCatalog, pillarMap, questionsForTest } from "../../lib/data";
import { getAttempts } from "../../lib/progress";
const tones=["pastel-lavender","pastel-blue","pastel-mint","pastel-peach","pastel-butter","pastel-rose"];
const norm=(v:unknown)=>String(v??"").trim().toLowerCase();
export default function Tests(){
 const [attempts,setAttempts]=useState<any[]>([]);
 useEffect(()=>setAttempts(getAttempts()),[]);
 const latest=(id:string)=>attempts.filter(a=>a.testId===id).sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime())[0];
 return <div className="mx-auto max-w-7xl px-6 py-12 md:py-16"><div className="mb-10 max-w-3xl"><div className="text-xs font-black uppercase tracking-[.2em] text-[#817b9b]">Section 1</div><h1 className="mt-4 text-5xl font-black tracking-[-.045em]">30 Practice Tests</h1><p className="mt-3 text-[#707984]">Your completed tests stay marked, so you always know what is next.</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{appCatalog.tests.map((t:any,i:number)=>{const a=latest(t.test_id);const qs=questionsForTest(t.test_id);let correct=0,answered=0;if(a?.completedAt)qs.forEach((q:any)=>{if(a.answers?.[q.id]){answered++;if(norm(a.answers[q.id])===norm(q.a))correct++}});const accuracy=answered?Math.round(correct/answered*100):0;return <Link href={`/tests/${t.test_id}`} key={t.test_id} className={`soft-card ${tones[i%tones.length]} rounded-[2rem] p-6 transition hover:-translate-y-1 hover:shadow-xl`}><div className="flex items-start justify-between gap-4"><span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-black tracking-wide">TEST {String(i+1).padStart(2,"0")}</span><span className={`rounded-full px-3 py-1 text-[11px] font-black ${a?.completedAt?"bg-[#e6f0e9] text-[#667c6d]":"bg-white/70"}`}>{a?.completedAt?"Completed":a?"In progress":"Not started"}</span></div><h2 className="mt-8 text-lg font-black">{t.title.replaceAll("_"," ")}</h2><p className="mt-2 text-sm text-[#6f7782]">{t.question_count} questions · no countdown</p>{a?.completedAt?<><div className="mt-5 flex items-end justify-between text-xs font-bold"><span>{correct}/{qs.length} correct</span><span>{accuracy}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full bg-[#829789]" style={{width:`${accuracy}%`}}/></div></>:<div className="mt-6 text-sm font-bold text-[#6f6a8f]">{a?"Resume where you left off →":"Start test →"}</div>}</Link>})}</div></div>;
}
