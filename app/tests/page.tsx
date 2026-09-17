"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import {appCatalog, questionsForTest} from "../../lib/data";
import {getAttempts, getStarredTests, toggleStarredTest} from "../../lib/progress";

const tones=["tone-pink","tone-lavender","tone-lime","tone-mint","tone-sky","tone-peach"];
const testPillar=(t:any)=>t.subtype==="deductive_logical"?"deductive":t.pillar;
const pretty=(v:string)=>v.replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());

export default function Tests(){
  const [filter,setFilter]=useState("all");
  const [stars,setStars]=useState<string[]>(()=>getStarredTests());
  const attempts=useMemo(()=>getAttempts(),[]);
  const latest=(id:string)=>attempts.filter(a=>a.testId===id).sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime())[0];
  const tests=filter==="all"?appCatalog.tests:appCatalog.tests.filter((t:any)=>testPillar(t)===filter);

  return <div className="app-page">
    <div className="section-head">
      <div>
        <p className="eyebrow">Practice by test</p>
        <h1 className="section-title">Choose a practice test.</h1>
        <p className="mt-3 text-sm text-[#99968f]">Pick any test below, or filter by reasoning pillar.</p>
      </div>
    </div>

    <div className="mb-5 flex flex-wrap gap-2">
      {[{id:"all",name:"All tests"},...appCatalog.pillars.map((p:any)=>({id:p.id,name:p.name}))].map((p:any)=><button key={p.id} onClick={()=>setFilter(p.id)} className={`rounded-full border px-3 py-2 text-xs transition ${filter===p.id?"border-[#222321] bg-[#222321] text-white":"border-[#e7e5de] bg-white/70 text-[#77736b] hover:border-[#bbb7ae]"}`}>{p.name}</button>)}
    </div>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {tests.map((t:any,i:number)=>{
        const qs=questionsForTest(t.test_id);
        const a=latest(t.test_id);
        const starred=stars.includes(t.test_id);
        let correct=0;
        if(a?.completedAt) qs.forEach((q:any)=>{if(a.answers?.[q.id]!==undefined&&String(a.answers[q.id]).trim().toLowerCase()===String(q.a??"").trim().toLowerCase()) correct++});
        return <article key={t.test_id} className={`relative flex min-h-[205px] flex-col rounded-2xl border border-[#e7e5de] p-5 ${tones[i%tones.length]}`}>
          <button onClick={()=>{toggleStarredTest(t.test_id);setStars(getStarredTests())}} aria-label={starred?"Unstar test":"Star test"} className="absolute right-4 top-4 border-0 bg-transparent text-lg text-[#77736b]">{starred?"★":"☆"}</button>
          <p className="practice-index">TEST {t.test_id.replace("TEST_","")}</p>
          <h2 className="mt-4 pr-8 text-lg font-medium tracking-[-.03em]">{t.title.replaceAll("_"," ")}</h2>
          <p className="mt-2 text-[11px] text-[#77736b]">{pretty(testPillar(t))} · {pretty(t.subtype||"")} · {qs.length} questions</p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-6">
            <span className="text-[11px] text-[#8d8981]">{a?.completedAt?`${correct}/${qs.length} correct`:a?"Resume":"Not started"}</span>
            <Link href={`/tests/${t.test_id}`} className="yellow-button">Open →</Link>
          </div>
        </article>;
      })}
    </div>
  </div>;
}
