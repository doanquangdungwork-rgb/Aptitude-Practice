"use client";
import Link from "next/link";
import {Suspense,useState} from "react";
import {useSearchParams} from "next/navigation";
import {appCatalog,questionsForTest} from "../../lib/data";
import {getAttempts,getStarredTests,toggleStarredTest} from "../../lib/progress";

const tones=["tone-pink","tone-lavender","tone-lime","tone-mint","tone-sky","tone-peach"];
const testPillar=(t:any)=>t.subtype==="deductive_logical"?"deductive":t.pillar;
const pretty=(v:string)=>v.replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());

function PracticeContent(){
 const searchParams=useSearchParams();
 const [pillar,setPillar]=useState(searchParams.get("pillar")||"");
 const [attempts,setAttempts]=useState<any[]>([]);
 const [stars,setStars]=useState<string[]>([]);
 const open=(id:string)=>{setPillar(x=>x===id?"":id);setAttempts(getAttempts());setStars(getStarredTests())};
 const latest=(id:string)=>attempts.filter(a=>a.testId===id).sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime())[0];
 const selected=appCatalog.pillars.find((p:any)=>p.id===pillar);
 const tests=pillar?appCatalog.tests.filter((t:any)=>testPillar(t)===pillar):[];
 return <div className="app-page">
  <div className="section-head"><div><p className="eyebrow">Practice by type</p><h1 className="section-title">Choose a reasoning pillar.</h1><p className="mt-3 text-sm text-[#99968f]">Focus on one reasoning style when you want a targeted session.</p></div></div>

  <div className="practice-grid">
   {appCatalog.pillars.map((p:any,i:number)=>{const isOpen=pillar===p.id;return <button key={p.id} onClick={()=>open(p.id)} aria-expanded={isOpen} className={`practice-card ${tones[i%tones.length]} text-left ${isOpen?"ring-1 ring-[#222321]/15":""}`}>
    <span className="practice-index">{String(i+1).padStart(2,"0")}</span>
    <h3>{p.name}</h3>
    <p>{p.description}</p>
    <span className="practice-arrow">{isOpen?"↓":"→"}</span>
   </button>})}
  </div>

  {pillar&&<section className="mt-5 overflow-hidden rounded-2xl border border-[#e7e5de] bg-white/80">
   <div className="flex items-end justify-between gap-6 border-b border-[#e7e5de] px-5 py-4">
    <div><p className="eyebrow">Selected pillar</p><h2 className="mt-1 text-xl font-medium tracking-[-.035em]">{selected?.name}</h2></div>
    <span className="shrink-0 text-[11px] text-[#aaa7a0]">{tests.length} {tests.length===1?"test":"tests"}</span>
   </div>
   {tests.length?<div className="overflow-x-auto px-5 py-5">
    <div className="flex w-max min-w-full gap-3 pb-2">
     {tests.map((t:any)=>{const qs=questionsForTest(t.test_id);const a=latest(t.test_id);const starred=stars.includes(t.test_id);let correct=0;if(a?.completedAt)qs.forEach((q:any)=>{if(a.answers?.[q.id]!==undefined&&String(a.answers[q.id]).trim().toLowerCase()===String(q.a??"").trim().toLowerCase())correct++});return <article key={t.test_id} className="relative flex w-[290px] shrink-0 flex-col rounded-xl border border-[#e7e5de] bg-[#fbfaf6] p-4">
      <button onClick={()=>{toggleStarredTest(t.test_id);setStars(getStarredTests())}} aria-label={starred?"Unstar test":"Star test"} className="absolute right-3 top-3 border-0 bg-transparent text-lg text-[#77736b]">{starred?"★":"☆"}</button>
      <p className="practice-index">TEST {t.test_id.replace("TEST_","")}</p>
      <h3 className="mt-4 pr-8 text-base font-medium tracking-[-.025em]">{t.title.replaceAll("_"," ")}</h3>
      <p className="mt-2 text-[11px] text-[#aaa7a0]">{qs.length} questions · {pretty(t.subtype)}</p>
      <div className="mt-6 flex items-center justify-between gap-2"><span className="text-[11px] text-[#8d8981]">{a?.completedAt?`${correct}/${qs.length} correct`:a?"Resume":"Not started"}</span><Link href={`/tests/${t.test_id}`} className="yellow-button">Open →</Link></div>
     </article>})}
    </div>
   </div>:<div className="p-8 text-center text-xs text-[#aaa7a0]">No tests are indexed under this pillar yet.</div>}
  </section>}
 </div>
}

export default function Practice(){
 return <Suspense fallback={<div className="app-page"><div className="section-head"><div><p className="eyebrow">Practice by type</p><h1 className="section-title">Choose a reasoning pillar.</h1></div></div></div>}><PracticeContent/></Suspense>;
}
