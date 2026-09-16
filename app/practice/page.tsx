"use client";
import Link from "next/link";
import {useState} from "react";
import {appCatalog,questionsForTest,questionsForPillar} from "../../lib/data";
import {getAttempts,getStarredTests,toggleStarredTest} from "../../lib/progress";

const tones=["tone-pink","tone-lavender","tone-lime","tone-mint","tone-sky","tone-peach"];
const testPillar=(t:any)=>t.subtype==="deductive_logical"?"deductive":t.pillar;
const pretty=(v:string)=>v.replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());

export default function Practice(){
  const [pillar,setPillar]=useState("");
  const [attempts,setAttempts]=useState<any[]>([]);
  const [stars,setStars]=useState<string[]>([]);

  const selectPillar=(id:string)=>{
    setPillar(current=>current===id?"":id);
    if(!attempts.length) setAttempts(getAttempts());
    if(!stars.length) setStars(getStarredTests());
  };

  const selected=appCatalog.pillars.find((p:any)=>p.id===pillar);
  const tests=appCatalog.tests.filter((t:any)=>testPillar(t)===pillar);
  const latest=(id:string)=>attempts.filter(a=>a.testId===id).sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime())[0];
  const pillarCount=pillar?tests.reduce((sum:number,t:any)=>sum+questionsForTest(t.test_id).length,0):0;

  return <div className="app-page">
    <div className="section-head"><div><p className="eyebrow">Section 2 · Practice by type</p><h1 className="section-title">Choose a reasoning pillar.</h1><p className="mt-3 text-sm text-[#99968f]">Open a pillar to browse the practice tests inside it.</p></div></div>

    <div className="practice-pillar-list">
      {appCatalog.pillars.map((p:any,i:number)=>{
        const open=pillar===p.id;
        const childTests=appCatalog.tests.filter((t:any)=>testPillar(t)===p.id);
        return <section key={p.id} className={`pillar-accordion ${open?"open":""}`}>
          <button className={`practice-card pillar-card ${tones[i%tones.length]} ${open?"selected":""}`} onClick={()=>selectPillar(p.id)} aria-expanded={open}>
            <div><span className="practice-index">{String(i+1).padStart(2,"0")}</span><h3>{p.name}</h3><p>{p.description}</p></div>
            <span className="practice-arrow">{open?"↑":"→"}</span>
          </button>
          {open && <div className="pillar-test-drawer">
            <div className="pillar-test-drawer-head"><div><span className="eyebrow">{selected?.name}</span><h2>Practice tests</h2></div><span>{childTests.length} {childTests.length===1?"test":"tests"}</span></div>
            {childTests.length?<div className="pillar-test-scroller">{childTests.map((t:any,index:number)=>{
              const qs=questionsForTest(t.test_id); const a=latest(t.test_id); const starred=stars.includes(t.test_id); let correct=0;
              if(a?.completedAt) qs.forEach((q:any)=>{if(a.answers?.[q.id]!==undefined && String(a.answers[q.id]).trim().toLowerCase()===String(q.a??"").trim().toLowerCase()) correct++});
              return <article key={t.test_id} className="pillar-test-card">
                <button aria-label={starred?"Unstar test":"Star test"} onClick={()=>{toggleStarredTest(t.test_id);setStars(getStarredTests())}} className="pillar-test-star">{starred?"★":"☆"}</button>
                <div className="practice-index">TEST {t.test_id.replace("TEST_","")}</div>
                <h3>{t.title.replaceAll("_"," ")}</h3>
                <p>{qs.length} questions · {pretty(t.subtype)}</p>
                <div className="pillar-test-footer"><span>{a?.completedAt?`${correct}/${qs.length} correct`:a?"Resume":"Not started"}</span><Link href={`/tests/${t.test_id}`} className="yellow-button">Open →</Link></div>
              </article>
            })}</div>:<div className="pillar-test-empty">No tests are indexed under this pillar yet.</div>}
          </div>}
        </section>
      })}
    </div>
  </div>
}
