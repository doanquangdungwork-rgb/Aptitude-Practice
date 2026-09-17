"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import {appCatalog,questionsForTest} from "../lib/data";

const tones=["tone-pink","tone-lavender","tone-lime","tone-mint","tone-sky","tone-peach"];
const testPillar=(t:any)=>t.subtype==="deductive_logical"?"deductive":t.pillar;
const pretty=(v:string)=>v.replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());

function getAttempts(){
  if(typeof window==="undefined") return [];
  try{return JSON.parse(localStorage.getItem("aptitude_attempts")||"[]")}catch{return[]}
}

function TestFamilyDropdown({pillarId}:{pillarId:string}){
  const [overviewTest,setOverviewTest]=useState<any>(null);
  const [attempts,setAttempts]=useState<any[]>([]);
  const tests=appCatalog.tests.filter((t:any)=>testPillar(t)===pillarId);
  const pillar=appCatalog.pillars.find((p:any)=>p.id===pillarId);
  const latest=(id:string)=>attempts.filter(a=>a.testId===id).sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime())[0];
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

  return <>
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#e7e5de] bg-white/80">
      <div className="flex items-end justify-between gap-6 border-b border-[#e7e5de] px-5 py-4">
        <div><p className="eyebrow">Selected pillar</p><h3 className="mt-1 text-xl font-medium tracking-[-.035em]">{pillar?.name}</h3></div>
        <span className="shrink-0 text-[11px] text-[#aaa7a0]">{tests.length} {tests.length===1?"test":"tests"}</span>
      </div>
      {tests.length?<div className="overflow-x-auto px-5 py-5"><div className="flex w-max min-w-full gap-3 pb-2">
        {tests.map((t:any)=>{const qs=questionsForTest(t.test_id);const a=latest(t.test_id);let correct=0;if(a?.completedAt)qs.forEach((q:any)=>{if(a.answers?.[q.id]!==undefined&&String(a.answers[q.id]).trim().toLowerCase()===String(q.a??"").trim().toLowerCase())correct++});return <article key={t.test_id} className="relative flex w-[290px] shrink-0 flex-col rounded-xl border border-[#e7e5de] bg-[#fbfaf6] p-4">
          <p className="practice-index">TEST {t.test_id.replace("TEST_","")}</p><h4 className="mt-4 pr-3 text-base font-medium tracking-[-.025em]">{t.title.replaceAll("_"," ")}</h4><p className="mt-2 text-[11px] text-[#aaa7a0]">{qs.length} questions · {pretty(t.subtype)}</p>
          <div className="mt-6 flex items-center justify-between gap-2"><span className="text-[11px] text-[#8d8981]">{a?.completedAt?`${correct}/${qs.length} correct`:a?"Resume":"Not started"}</span><button type="button" onClick={()=>{setAttempts(getAttempts());setOverviewTest(t)}} className="yellow-button">Open →</button></div>
        </article>})}
      </div></div>:<div className="p-8 text-center text-xs text-[#aaa7a0]">No tests are indexed under this pillar yet.</div>}
    </section>

    {overviewTest&&<div className="test-overview-backdrop" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setOverviewTest(null)}}><section className="test-overview-modal" role="dialog" aria-modal="true" aria-labelledby="test-overview-title">
      <button type="button" className="test-overview-close" onClick={()=>setOverviewTest(null)} aria-label="Close">×</button>
      <div className="test-overview-kicker"><span className="eyebrow">Test overview</span><span className="test-overview-number">TEST {overviewTest.test_id.replace("TEST_","")}</span></div>
      <h2 id="test-overview-title" className="test-overview-title">{overviewTest.title.replaceAll("_"," ")}</h2>
      <div className="test-overview-stats"><div><span>Questions</span><strong>{overviewQuestions.length}</strong></div><div><span>Time limit</span><strong>{overviewQuestions.length} min</strong></div></div>
      <p className="test-overview-description">{overviewTest.description||`Read closely and separate fact from assumption. Focus on the information given and choose the answer that is directly supported.`}</p>
      <div className="test-overview-tips"><p className="eyebrow">Quick tips</p><ul><li>Answer only from the information provided — do not use outside knowledge.</li><li>Watch for absolute wording and claims that the information does not fully support.</li><li>If the information does not establish a claim, do not assume it.</li></ul></div>
      <div className="test-overview-history"><p className="eyebrow">Your history</p><p>{overviewAttempt?.completedAt?"You have completed this test before — your latest result is saved.":overviewAttempt?"You have an unfinished attempt — you can resume it from the test.":"No attempts yet — this will be your first try."}</p></div>
      <div className="test-overview-actions"><button type="button" onClick={()=>setOverviewTest(null)} className="outline-action">Not yet</button><Link href={`/tests/${overviewTest.test_id}`} onClick={()=>setOverviewTest(null)} className="yellow-button">Ready, start test →</Link></div>
    </section></div>}

    <style jsx>{`
      .test-overview-backdrop{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(25,23,20,.48)}
      .test-overview-modal{position:relative;width:min(500px,100%);max-height:min(680px,calc(100vh - 64px));overflow:auto;border:1px solid rgba(35,33,29,.10);border-radius:20px;background:#fffdfa;padding:26px 28px;box-shadow:0 20px 60px rgba(35,33,29,.20)}
      .test-overview-close{position:absolute;right:16px;top:14px;width:32px;height:32px;border:0;border-radius:50%;background:#f3f0e9;color:#65615a;font-size:21px;line-height:1;cursor:pointer}
      .test-overview-kicker{display:flex;align-items:center;gap:12px}.test-overview-number{font-size:10px;font-weight:800;letter-spacing:.12em;color:#aaa7a0}
      .test-overview-title{margin-top:8px;padding-right:42px;font-size:clamp(26px,4vw,38px);font-weight:500;line-height:1.06;letter-spacing:-.05em;color:#252421}
      .test-overview-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:20px}.test-overview-stats div{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:12px 14px;border:1px solid #e7e5de;border-radius:12px;background:#f8f6f0}.test-overview-stats span{font-size:10px;color:#99968f}.test-overview-stats strong{font-size:17px;letter-spacing:-.03em;color:#34322e}
      .test-overview-description{margin-top:18px;font-size:13px;line-height:1.6;color:#77736c}.test-overview-tips,.test-overview-history{margin-top:18px;padding-top:17px;border-top:1px solid #e7e5de}.test-overview-tips ul{margin:8px 0 0;padding-left:17px;color:#66625b;font-size:11px;line-height:1.65}.test-overview-tips li+li{margin-top:4px}.test-overview-history p:last-child{margin-top:7px;font-size:11px;line-height:1.55;color:#77736c}.test-overview-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:22px}
      @media(max-width:600px){.test-overview-backdrop{padding:12px}.test-overview-modal{padding:22px 18px 18px;border-radius:18px}.test-overview-actions{justify-content:stretch}.test-overview-actions>*{flex:1;justify-content:center;text-align:center}.test-overview-stats div{display:block}.test-overview-stats strong{display:block;margin-top:3px}}
    `}</style>
  </>;
}

function TestFamilySection(){
  const [pillar,setPillar]=useState("");
  return <section>
    <div className="section-head"><div><p className="eyebrow">Practice by test</p><h2 className="section-title">Choose a test family</h2></div><p className="section-note">Browse the practice tests inside each reasoning family.<br/>Choose a family to see its smaller tests.</p></div>
    <div className="practice-grid">{appCatalog.pillars.map((p:any,i:number)=>{const isOpen=pillar===p.id;return <button key={p.id} type="button" onClick={()=>setPillar(x=>x===p.id?"":p.id)} aria-expanded={isOpen} className={`practice-card ${tones[i%tones.length]} text-left ${isOpen?"ring-1 ring-[#222321]/15":""}`}>
      <span className="practice-index">{String(i+1).padStart(2,"0")}</span><h3>{p.name}</h3><p>{p.description}</p><span className="practice-arrow">{isOpen?"↓":"→"}</span>
    </button>})}</div>
    {pillar&&<TestFamilyDropdown pillarId={pillar}/>} 
  </section>
}

export default function Home(){return <div className="app-page home-page">
  <section className="editorial-hero"><div className="hero-copy"><p className="hero-label">Let's practice</p><h1 className="hero-title"><span className="soft">small practice</span><br/><span className="strong">bigger progress.</span></h1><p className="hero-lede">Short, image-based aptitude tests to build real-world skills.</p><div className="hero-actions"><Link href="/practice" className="primary-action">Start practicing →</Link><Link href="#practice-by-test" className="secondary-action">Explore by test</Link></div></div><div className="hero-note" aria-hidden="true"><div className="hero-hand">Progress<br/>lives here.</div><div className="hero-smiley">☺</div><div className="sticky sticky-one">PRACTICE</div><div className="sticky sticky-two">LEARN</div><div className="sticky sticky-three">GROW</div><div className="hero-arrow">↗</div></div></section>
  <div id="practice-by-test"><TestFamilySection/></div>
  <footer className="home-footer border-t border-[#e7e5de] pt-5 text-xs text-[#aaa7a0]"><b className="text-[#44433f]">{appCatalog.stats.test_count}</b> curated tests<span className="ml-5"><b className="text-[#44433f]">{appCatalog.stats.question_count.toLocaleString()}</b> questions indexed</span></footer>
  <style jsx>{`
    .home-page{padding-top:0;padding-bottom:12px}
    .home-page .editorial-hero{transform:scale(.94);transform-origin:top center;margin-bottom:-44px}
    .home-page .hero-copy{margin-top:-18px;margin-bottom:-14px}
    .home-page #practice-by-test{transform:scale(.94);transform-origin:top center;margin-bottom:-20px}
    .home-page .home-footer{transform:scale(.94);transform-origin:top left}
    .home-page .section-head{margin-bottom:14px}
    .home-page .practice-grid{gap:10px}
    .home-page .practice-card{min-height:84px;height:84px;padding:7px 13px 6px}
    .home-page .practice-card h3{margin-top:5px;font-size:16px}
    .home-page .practice-card p{margin-top:3px;line-height:1.18;font-size:10.5px}
    .home-page .practice-arrow{right:12px;bottom:6px;width:24px;height:24px}
    .home-page .home-footer{padding-top:13px!important}
    @media(max-width:900px){.home-page .editorial-hero,.home-page #practice-by-test,.home-page .home-footer{transform:none;margin-bottom:0}.home-page .hero-copy{margin-top:-10px;margin-bottom:-10px}.home-page .practice-card{min-height:87px;height:87px}.home-page .home-footer{padding-top:13px!important}}
    @media(max-height:760px) and (min-width:901px){.home-page .editorial-hero{transform:scale(.9);margin-bottom:-58px}.home-page .hero-copy{margin-top:-18px;margin-bottom:-14px}.home-page #practice-by-test{transform:scale(.9);margin-bottom:-28px}.home-page .practice-card{min-height:80px;height:80px}}
  `}</style>
</div>}
