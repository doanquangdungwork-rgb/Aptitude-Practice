"use client";

import Link from "next/link";
import {useState} from "react";
import {appCatalog,questionsForTest} from "../lib/data";
import ProgressDashboard from "../components/progress-dashboard";

const tones=["tone-pink","tone-lavender","tone-lime","tone-mint","tone-sky","tone-peach"];
const testPillar=(t:any)=>t.subtype==="deductive_logical"?"deductive":t.pillar;
const pretty=(v:string)=>v.replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());

function TestFamilyDropdown({pillarId,close}:{pillarId:string;close:()=>void}){
  const tests=appCatalog.tests.filter((t:any)=>testPillar(t)===pillarId);
  const pillar=appCatalog.pillars.find((p:any)=>p.id===pillarId);
  return <section className="mt-5 overflow-hidden rounded-2xl border border-[#e7e5de] bg-white/80">
    <div className="flex items-end justify-between gap-6 border-b border-[#e7e5de] px-5 py-4">
      <div><p className="eyebrow">Selected pillar</p><h3 className="mt-1 text-xl font-medium tracking-[-.035em]">{pillar?.name}</h3></div>
      <button type="button" onClick={close} className="text-[11px] text-[#99968f] hover:text-[#44433f]">Close ×</button>
    </div>
    {tests.length?<div className="overflow-x-auto px-5 py-5">
      <div className="flex w-max min-w-full gap-3 pb-2">
        {tests.map((t:any)=>{const qs=questionsForTest(t.test_id);return <article key={t.test_id} className="relative flex w-[290px] shrink-0 flex-col rounded-xl border border-[#e7e5de] bg-[#fbfaf6] p-4">
          <p className="practice-index">TEST {t.test_id.replace("TEST_","")}</p>
          <h4 className="mt-4 pr-3 text-base font-medium tracking-[-.025em]">{t.title.replaceAll("_"," ")}</h4>
          <p className="mt-2 text-[11px] text-[#aaa7a0]">{qs.length} questions · {pretty(t.subtype)}</p>
          <div className="mt-6 flex items-center justify-end gap-2"><Link href={`/tests/${t.test_id}`} className="yellow-button">Start test →</Link></div>
        </article>})}
      </div>
    </div>:<div className="p-8 text-center text-xs text-[#aaa7a0]">No tests are indexed under this pillar yet.</div>}
  </section>
}

function TestFamilySection({label,title,note}:{label:string;title:string;note:string}){
  const [pillar,setPillar]=useState("");
  return <section>
    <div className="section-head"><div><p className="eyebrow">{label}</p><h2 className="section-title">{title}</h2></div><p className="section-note">{note}</p></div>
    <div className="practice-grid">
      {appCatalog.pillars.map((p:any,i:number)=>{const isOpen=pillar===p.id;return <button key={p.id} type="button" onClick={()=>setPillar(x=>x===p.id?"":p.id)} aria-expanded={isOpen} className={`practice-card ${tones[i%tones.length]} text-left ${isOpen?"ring-1 ring-[#222321]/15":""}`}>
        <span className="practice-index">{String(i+1).padStart(2,"0")}</span>
        <h3>{p.name}</h3>
        <p>{p.description}</p>
        <span className="practice-arrow">{isOpen?"↓":"→"}</span>
      </button>})}
    </div>
    {pillar&&<TestFamilyDropdown pillarId={pillar} close={()=>setPillar("")}/>} 
  </section>
}

export default function Home(){
  return <div className="app-page">
    <section className="editorial-hero">
      <div className="hero-copy">
        <p className="hero-label">Let's practice</p>
        <h1 className="hero-title"><span className="soft">small practice</span><br/><span className="strong">bigger progress.</span></h1>
        <p className="hero-lede">Short, image-based aptitude tests to build real-world skills.</p>
        <div className="hero-actions"><Link href="/practice" className="primary-action">Start practicing →</Link><Link href="#test-by-types" className="secondary-action">Explore by type</Link></div>
      </div>
      <div className="hero-note" aria-hidden="true"><div className="hero-hand">Progress<br/>lives here.</div><div className="hero-smiley">☺</div><div className="sticky sticky-one">PRACTICE</div><div className="sticky sticky-two">LEARN</div><div className="sticky sticky-three">GROW</div><div className="hero-arrow">↗</div></div>
    </section>

    <TestFamilySection
      label="Practice by test"
      title="Choose a test family"
      note={"Browse the practice tests inside each reasoning family.\nChoose a family to see its smaller tests."}
    />

    <section id="test-by-types" className="mt-14">
      <TestFamilySection
        label="Test by types"
        title="Practice a specific reasoning type"
        note={"Pick a reasoning family to open its available tests.\nYou can access the same tests from here or above."}
      />
    </section>

    <section className="mt-14"><ProgressDashboard compact/></section>
    <footer className="mt-14 border-t border-[#e7e5de] pt-6 text-xs text-[#aaa7a0]">
      <b className="text-[#44433f]">{appCatalog.stats.test_count}</b> curated tests
      <span className="ml-5"><b className="text-[#44433f]">{appCatalog.stats.question_count.toLocaleString()}</b> questions indexed</span>
    </footer>
  </div>
}
