"use client";

import Link from "next/link";
import {Suspense,useEffect,useMemo,useState} from "react";
import {useRouter,useSearchParams} from "next/navigation";
import {appCatalog,questionsForTest} from "../../lib/data";
import {getAttempts,getStarredTests,toggleStarredTest} from "../../lib/progress";

const tones=["tone-pink","tone-lavender","tone-lime","tone-mint","tone-sky","tone-peach"];
const testPillar=(t:any)=>t.subtype==="deductive_logical"?"deductive":t.pillar;
const categorySymbols=["◎","▥","○","△","≡","◯"];

function PracticeContent(){
  const searchParams=useSearchParams();
  const router=useRouter();
  const pillar=searchParams.get("pillar")||"";
  const [query,setQuery]=useState("");
  const [page,setPage]=useState(1);
  const [attempts,setAttempts]=useState<any[]>([]);
  const [stars,setStars]=useState<string[]>([]);
  const [launchTest,setLaunchTest]=useState<any>(null);
  const pageSize=10;

  useEffect(()=>{
    setPage(1);
    setAttempts(getAttempts());
    setStars(getStarredTests());
  },[pillar]);
  useEffect(()=>setPage(1),[query]);
  useEffect(()=>{
    const close=(e:KeyboardEvent)=>e.key==="Escape"&&setLaunchTest(null);
    window.addEventListener("keydown",close);
    document.body.style.overflow=launchTest?"hidden":"";
    return()=>{window.removeEventListener("keydown",close);document.body.style.overflow=""};
  },[launchTest]);

  const selected=appCatalog.pillars.find((p:any)=>p.id===pillar);
  const allTests=appCatalog.tests;
  const baseTests=pillar?allTests.filter((t:any)=>testPillar(t)===pillar):allTests;
  const tests=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q)return baseTests;
    return baseTests.filter((t:any)=>`${t.title} ${t.test_id} ${t.subtype||""}`.toLowerCase().includes(q));
  },[baseTests,query]);
  const totalPages=Math.max(1,Math.ceil(tests.length/pageSize));
  const safePage=Math.min(page,totalPages);
  const visibleTests=tests.slice((safePage-1)*pageSize,safePage*pageSize);
  const questionCount=baseTests.reduce((sum:number,t:any)=>sum+questionsForTest(t.test_id).length,0);
  const choosePillar=(id:string)=>{setQuery("");router.push(id?`/practice?pillar=${id}`:"/practice")};
  const latest=(id:string)=>attempts.filter(a=>a.testId===id).sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime())[0];

  return <div className="app-page practice-library-page">
    <header className="practice-library-header">
      <div><p className="eyebrow">Practice</p><h1>{selected?.name||"Practice library"}</h1><p className="practice-library-description">{selected?.description||"Explore every reasoning category and choose a focused practice session."}</p></div>
      <div className="library-count"><strong>{pillar?baseTests.length:allTests.length}</strong><span>Total tests</span></div>
    </header>

    <div className="library-summary"><span>{questionCount.toLocaleString()} questions indexed</span>{query&&<span>Showing results for “{query}”</span>}</div>

    <div className="category-nav practice-category-nav">
      <div className="category-buttons">
        <button type="button" className={!pillar?"active":""} onClick={()=>choosePillar("")}>All</button>
        {appCatalog.pillars.map((p:any)=><button key={p.id} type="button" className={pillar===p.id?"active":""} onClick={()=>choosePillar(p.id)}>{p.name}</button>)}
      </div>
      <label className="search-wrap"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search practice sets..." aria-label="Search practice sets" />{query&&<button type="button" className="search-clear" onClick={()=>setQuery("")} aria-label="Clear search">×</button>}</label>
    </div>

    {visibleTests.length?<div className="test-library-grid">
      {visibleTests.map((t:any,index:number)=>{
        const qs=questionsForTest(t.test_id); const a=latest(t.test_id); const starred=stars.includes(t.test_id); const absoluteIndex=(safePage-1)*pageSize+index; const tone=tones[absoluteIndex%tones.length];
        return <article key={t.test_id} className={`test-library-card ${tone}`}>
          <div className="test-card-art"><span>{categorySymbols[absoluteIndex%categorySymbols.length]}</span><small>{String(absoluteIndex+1).padStart(2,"0")}</small></div>
          <div className="test-card-body">
            <div className="test-card-topline"><span className="practice-index">TEST {t.test_id.replace("TEST_","")}</span><button type="button" className={`test-star ${starred?"starred":""}`} onClick={()=>{toggleStarredTest(t.test_id);setStars(getStarredTests())}} aria-label={starred?"Remove bookmark":"Bookmark test"}>{starred?"★":"☆"}</button></div>
            <h2>{t.title.replaceAll("_"," ")}</h2>
            <p className="test-card-meta">{qs.length} questions <span>·</span> {qs.length} min</p>
            <p className="test-card-status">{a?.completedAt?"Completed":a?"In progress":"Not started"}</p>
            <button type="button" className="test-start" onClick={()=>setLaunchTest(t)}>Start <span>→</span></button>
          </div>
        </article>
      })}
    </div>:<div className="empty-library"><p className="eyebrow">No matching tests</p><p>Try another search or choose a different reasoning category.</p></div>}

    <div className="library-pagination"><span>Showing {tests.length?((safePage-1)*pageSize+1):0}–{Math.min(safePage*pageSize,tests.length)} of {tests.length} tests</span>{totalPages>1&&<div className="page-controls"><button type="button" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={safePage===1}>‹</button>{Array.from({length:totalPages},(_,i)=>i+1).map(n=><button key={n} type="button" className={n===safePage?"current":""} onClick={()=>setPage(n)}>{n}</button>)}<button type="button" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages}>›</button></div>}</div>

    {launchTest&&<div className="launch-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setLaunchTest(null)}}>
      <div className="launch-modal" role="dialog" aria-modal="true" aria-labelledby="launch-title">
        <button className="launch-close" onClick={()=>setLaunchTest(null)} aria-label="Close">×</button>
        <div className="launch-art"><span>{categorySymbols[tests.findIndex((t:any)=>t.test_id===launchTest.test_id)%categorySymbols.length]}</span></div>
        <p className="eyebrow">{selected?.name||"Practice"} · TEST {launchTest.test_id.replace("TEST_","")}</p>
        <h2 id="launch-title">{launchTest.title.replaceAll("_"," ")}</h2>
        <div className="launch-meta"><span>{questionsForTest(launchTest.test_id).length} questions</span><span>{questionsForTest(launchTest.test_id).length} minutes</span><span>Timed</span></div>
        <p className="launch-copy">Ready to begin? Your answers and progress will be saved as you work through the test.</p>
        <div className="launch-actions"><button type="button" className="outline-action" onClick={()=>setLaunchTest(null)}>Not yet</button><button type="button" className="yellow-button" onClick={()=>router.push(`/tests/${launchTest.test_id}`)}>Start test →</button></div>
      </div>
    </div>}

    <style jsx>{`
      .practice-library-page{padding-top:20px;padding-bottom:70px;display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:28px;align-items:start}
      .practice-library-header{grid-column:1/-1;grid-row:1;display:flex;align-items:end;justify-content:space-between;gap:30px;padding:48px 0 26px;border-bottom:1px solid var(--line);width:100%}
      .practice-library-header h1{margin-top:7px;font-size:clamp(40px,5vw,64px);line-height:.96;letter-spacing:-.065em;font-weight:500}
      .practice-library-description{max-width:540px;margin-top:10px;font-size:13px;line-height:1.6;color:var(--muted)}
      .library-count{text-align:right;flex:0 0 auto}.library-count strong{display:block;font-size:40px;line-height:.9;font-weight:500;letter-spacing:-.06em}.library-count span{display:block;margin-top:8px;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.12em}
      .library-summary{grid-column:1;grid-row:2;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:12px 0;font-size:10px;color:#aaa7a0;min-height:46px}
      .practice-category-nav{display:contents}
      .practice-category-nav .category-buttons{grid-column:1/-1;grid-row:3;display:flex;align-items:center;gap:25px;min-width:0;overflow:hidden;white-space:nowrap;padding:0 0 12px;border-bottom:1px solid var(--line)}
      .practice-category-nav .category-buttons button{flex:0 0 auto;white-space:nowrap}
      .practice-category-nav .search-wrap{grid-column:2;grid-row:2;align-self:center;flex:0 0 420px;width:420px}
      .test-library-grid{grid-column:1/-1;grid-row:4;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:14px}.test-library-card{min-width:0;border:1px solid #ddd9d1;background:#fff;display:flex;flex-direction:column;overflow:hidden;min-height:305px}
      .test-card-art{height:78px;position:relative;display:flex;align-items:center;justify-content:center;border-bottom:1px solid rgba(34,35,33,.12);overflow:hidden}.test-card-art:before,.test-card-art:after{content:"";position:absolute;border:1px solid rgba(34,35,33,.45);border-radius:50%}.test-card-art:before{width:38px;height:38px}.test-card-art:after{width:38px;height:38px;transform:translateX(17px)}.test-card-art span{position:relative;z-index:2;font-size:25px;font-weight:300;line-height:1}.test-card-art small{position:absolute;left:10px;top:10px;font-size:9px;letter-spacing:.1em;color:rgba(34,35,33,.55)}
      .tone-lavender .test-card-art:before,.tone-lavender .test-card-art:after{border-radius:4px}.tone-lime .test-card-art:before{border-radius:50%}.tone-mint .test-card-art:before{border-radius:0}.tone-sky .test-card-art:before{transform:rotate(45deg)}.tone-peach .test-card-art:after{border-radius:5px}.tone-pink .test-card-art{background:var(--pink)}.tone-lavender .test-card-art{background:var(--lav)}.tone-lime .test-card-art{background:#e8ef9d}.tone-mint .test-card-art{background:var(--mint)}.tone-sky .test-card-art{background:var(--sky)}.tone-peach .test-card-art{background:var(--peach)}
      .test-card-body{position:relative;display:flex;flex:1;flex-direction:column;padding:11px 11px 10px;background:rgba(255,255,255,.86)}.test-card-topline{display:flex;justify-content:space-between;align-items:center}.test-star{border:0;background:transparent;padding:0;font-size:17px;line-height:1;color:#8f8b83}.test-star.starred{color:#3f3e39}.test-card-body h2{margin-top:17px;min-height:38px;font-size:14px;line-height:1.2;font-weight:500;letter-spacing:-.025em}.test-card-meta{margin-top:9px;font-size:9.5px;color:#89857d}.test-card-meta span{padding:0 3px}.test-card-status{margin-top:5px;font-size:9px;color:#aaa7a0}.test-start{display:flex;align-items:center;justify-content:center;gap:7px;margin-top:auto;padding:8px 10px;background:#222321;color:#fff;font-size:10px;font-weight:600;border:0;width:100%}.test-start span{font-size:14px;line-height:0}
      .library-pagination{grid-column:1/-1;grid-row:5;display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:17px;padding-top:13px;border-top:1px solid var(--line);font-size:10px;color:#aaa7a0}.page-controls{display:flex;gap:4px}.page-controls button{width:27px;height:27px;border:1px solid #ddd9d1;background:#fff;color:#55524d;font-size:10px}.page-controls button.current{background:#222321;color:#fff;border-color:#222321}.page-controls button:disabled{opacity:.35;cursor:default}
      .launch-overlay{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:24px;background:rgba(31,31,28,.32);backdrop-filter:blur(5px)}.launch-modal{position:relative;width:min(520px,100%);padding:26px;border:1px solid #dedbd3;border-radius:18px;background:#fffefa;box-shadow:0 24px 80px rgba(28,27,24,.18)}.launch-close{position:absolute;right:17px;top:14px;border:0;background:transparent;font-size:24px;line-height:1;color:#8d8981}.launch-art{height:92px;margin-bottom:22px;border:1px solid rgba(34,35,33,.12);display:grid;place-items:center;background:var(--pink);overflow:hidden;position:relative}.launch-art:before,.launch-art:after{content:"";position:absolute;border:1px solid rgba(34,35,33,.35);border-radius:50%;width:54px;height:54px}.launch-art:after{transform:translateX(24px)}.launch-art span{position:relative;z-index:2;font-size:30px}.launch-modal h2{margin-top:8px;font-size:32px;line-height:1;letter-spacing:-.05em;font-weight:500}.launch-meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:17px}.launch-meta span{padding:7px 10px;border-radius:999px;background:#f2f1ec;font-size:10px;font-weight:700;color:#69665f}.launch-copy{margin-top:18px;max-width:430px;font-size:12px;line-height:1.7;color:#99968f}.launch-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}.launch-actions .yellow-button{border:0}.launch-actions .outline-action{background:#fff}
      @media(max-width:1200px){.practice-category-nav .search-wrap{width:260px}.practice-category-nav .category-buttons{gap:18px}.test-library-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:900px){.practice-library-page{display:block;padding-top:20px}.practice-library-header{padding-top:34px}.practice-category-nav{display:flex;align-items:stretch;flex-direction:column;gap:9px;overflow:visible}.practice-category-nav .category-buttons{width:100%;flex:none;overflow-x:auto;overflow-y:hidden;padding-bottom:2px;border-bottom:0}.practice-category-nav .search-wrap{width:100%;flex-basis:auto}.test-library-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.library-count strong{font-size:32px}}
      @media(max-width:560px){.practice-library-header{display:block}.library-count{text-align:left;margin-top:18px}.library-summary{display:block}.library-summary span+span{display:block;margin-top:5px}.test-library-grid{grid-template-columns:1fr}.test-library-card{min-height:300px}.library-pagination{align-items:flex-start;flex-direction:column}.practice-category-nav .category-buttons{gap:20px}.launch-modal{padding:21px}.launch-modal h2{font-size:27px}}
    `}</style>
  </div>
}

export default function Practice(){return <Suspense fallback={<div className="app-page"><div className="practice-library-header"><div><p className="eyebrow">Practice</p><h1>Practice library</h1></div></div></div>}><PracticeContent/></Suspense>}
