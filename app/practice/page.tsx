"use client";
import Link from "next/link";
import {Suspense,useEffect,useState} from "react";
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
 const [overviewTest,setOverviewTest]=useState<any>(null);
 const open=(id:string)=>{setPillar(x=>x===id?"":id);setAttempts(getAttempts());setStars(getStarredTests())};
 const latest=(id:string)=>attempts.filter(a=>a.testId===id).sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime())[0];
 const selected=appCatalog.pillars.find((p:any)=>p.id===pillar);
 const tests=pillar?appCatalog.tests.filter((t:any)=>testPillar(t)===pillar):[];
 const overviewQuestions=overviewTest?questionsForTest(overviewTest.test_id):[];
 const overviewAttempt=overviewTest?latest(overviewTest.test_id):null;

 useEffect(()=>{
  if(!overviewTest) return;
  const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setOverviewTest(null)};
  document.addEventListener("keydown",onKey);
  const previous=document.body.style.overflow;
  document.body.style.overflow="hidden";
  return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow=previous};
 },[overviewTest]);

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
      <div className="mt-6 flex items-center justify-between gap-2"><span className="text-[11px] text-[#8d8981]">{a?.completedAt?`${correct}/${qs.length} correct`:a?"Resume":"Not started"}</span><button type="button" onClick={()=>{setAttempts(getAttempts());setOverviewTest(t)}} className="yellow-button">Open →</button></div>
     </article>})}
    </div>
   </div>:<div className="p-8 text-center text-xs text-[#aaa7a0]">No tests are indexed under this pillar yet.</div>}
  </section>}

  {overviewTest&&<div className="test-overview-backdrop" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setOverviewTest(null)}}>
   <section className="test-overview-modal" role="dialog" aria-modal="true" aria-labelledby="test-overview-title">
    <button type="button" className="test-overview-close" onClick={()=>setOverviewTest(null)} aria-label="Close">×</button>
    <div className="test-overview-kicker"><span className="eyebrow">Test overview</span><span className="test-overview-number">TEST {overviewTest.test_id.replace("TEST_","")}</span></div>
    <h2 id="test-overview-title" className="test-overview-title">{overviewTest.title.replaceAll("_"," ")}</h2>
    <div className="test-overview-stats">
      <div><span>Questions</span><strong>{overviewQuestions.length}</strong></div>
      <div><span>Time limit</span><strong>{overviewQuestions.length} min</strong></div>
    </div>
    <p className="test-overview-description">{overviewTest.description || `Read closely and separate fact from assumption. Focus on the information given and choose the answer that is directly supported.`}</p>
    <div className="test-overview-tips">
      <p className="eyebrow">Quick tips</p>
      <ul>
       <li>Answer only from the information provided — do not use outside knowledge.</li>
       <li>Watch for absolute wording and claims that the information does not fully support.</li>
       <li>If the information does not establish a claim, do not assume it.</li>
      </ul>
    </div>
    <div className="test-overview-history">
      <p className="eyebrow">Your history</p>
      <p>{overviewAttempt?.completedAt?"You have completed this test before — your latest result is saved.":overviewAttempt?"You have an unfinished attempt — you can resume it from the test.":"No attempts yet — this will be your first try."}</p>
    </div>
    <div className="test-overview-actions">
      <button type="button" onClick={()=>setOverviewTest(null)} className="outline-action">Not yet</button>
      <Link href={`/tests/${overviewTest.test_id}`} onClick={()=>setOverviewTest(null)} className="yellow-button">Ready, start test →</Link>
    </div>
   </section>
  </div>}

  <style jsx>{`
   .test-overview-backdrop{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(35,33,29,.32);backdrop-filter:blur(7px)}
   .test-overview-modal{position:relative;width:min(560px,100%);max-height:min(760px,calc(100vh - 48px));overflow:auto;border:1px solid rgba(35,33,29,.10);border-radius:24px;background:#fffdfa;padding:32px;box-shadow:0 24px 80px rgba(35,33,29,.18)}
   .test-overview-close{position:absolute;right:18px;top:16px;width:34px;height:34px;border:0;border-radius:50%;background:#f3f0e9;color:#65615a;font-size:22px;line-height:1;cursor:pointer}
   .test-overview-kicker{display:flex;align-items:center;gap:12px}
   .test-overview-number{font-size:10px;font-weight:800;letter-spacing:.12em;color:#aaa7a0}
   .test-overview-title{margin-top:10px;padding-right:42px;font-size:clamp(30px,5vw,44px);font-weight:500;line-height:1.04;letter-spacing:-.055em;color:#252421}
   .test-overview-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:26px}
   .test-overview-stats div{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:15px 16px;border:1px solid #e7e5de;border-radius:14px;background:#f8f6f0}
   .test-overview-stats span{font-size:11px;color:#99968f}
   .test-overview-stats strong{font-size:19px;letter-spacing:-.03em;color:#34322e}
   .test-overview-description{margin-top:22px;font-size:14px;line-height:1.65;color:#77736c}
   .test-overview-tips,.test-overview-history{margin-top:22px;padding-top:20px;border-top:1px solid #e7e5de}
   .test-overview-tips ul{margin:10px 0 0;padding-left:18px;color:#66625b;font-size:12px;line-height:1.7}
   .test-overview-tips li+li{margin-top:5px}
   .test-overview-history p:last-child{margin-top:9px;font-size:12px;line-height:1.6;color:#77736c}
   .test-overview-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:28px}
   @media(max-width:600px){.test-overview-backdrop{padding:14px}.test-overview-modal{padding:26px 20px 22px;border-radius:20px}.test-overview-actions{justify-content:stretch}.test-overview-actions>*{flex:1;justify-content:center;text-align:center}.test-overview-stats div{display:block}.test-overview-stats strong{display:block;margin-top:4px}}
  `}</style>
 </div>
}

export default function Practice(){
 return <Suspense fallback={<div className="app-page"><div className="section-head"><div><p className="eyebrow">Practice by type</p><h1 className="section-title">Choose a reasoning pillar.</h1></div></div></div>}><PracticeContent/></Suspense>;
}
