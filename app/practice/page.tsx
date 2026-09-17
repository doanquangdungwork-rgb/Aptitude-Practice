"use client";

import Link from "next/link";
import {Suspense,useEffect,useMemo,useState} from "react";
import {useSearchParams} from "next/navigation";
import {appCatalog,questionsForTest} from "../../lib/data";
import {getAttempts,getStarredTests,toggleStarredTest} from "../../lib/progress";

const categories=[
  {id:"",name:"All"},
  ...appCatalog.pillars.map((p:any)=>({id:p.id,name:p.name}))
];
const testPillar=(t:any)=>t.subtype==="deductive_logical"?"deductive":t.pillar;

function PracticeContent(){
  const searchParams=useSearchParams();
  const [pillar,setPillar]=useState(searchParams.get("pillar")||"");
  const [query,setQuery]=useState("");
  const [page,setPage]=useState(1);
  const [stars,setStars]=useState<string[]>([]);
  const [attempts,setAttempts]=useState<any[]>([]);
  const perPage=10;

  useEffect(()=>{setPillar(searchParams.get("pillar")||"");setPage(1)},[searchParams]);
  useEffect(()=>{setStars(getStarredTests());setAttempts(getAttempts())},[]);

  const selected=appCatalog.pillars.find((p:any)=>p.id===pillar);
  const filtered=useMemo(()=>appCatalog.tests.filter((t:any)=>{
    const matchesPillar=!pillar || testPillar(t)===pillar;
    const q=query.trim().toLowerCase();
    const matchesSearch=!q || `${t.title} ${t.test_id} ${t.subtype||""}`.toLowerCase().includes(q);
    return matchesPillar&&matchesSearch;
  }),[pillar,query]);
  const pageCount=Math.max(1,Math.ceil(filtered.length/perPage));
  const currentPage=Math.min(page,pageCount);
  const visible=filtered.slice((currentPage-1)*perPage,currentPage*perPage);
  const start=filtered.length?(currentPage-1)*perPage+1:0;
  const end=Math.min(currentPage*perPage,filtered.length);
  const latest=(id:string)=>attempts.filter(a=>a.testId===id).sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime())[0];

  const selectCategory=(id:string)=>{setPillar(id);setPage(1);window.history.replaceState(null,"",id?`/practice?pillar=${id}`:"/practice")};

  return <div className="app-page practice-library-page">
    <div className="practice-toolbar">
      <nav className="category-nav" aria-label="Practice categories">
        {categories.map((c:any)=><button key={c.id||"all"} type="button" onClick={()=>selectCategory(c.id)} className={pillar===c.id?"active":""}>{c.name}</button>)}
      </nav>
      <label className="practice-search"><span>⌕</span><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="Search practice sets" aria-label="Search practice sets" /></label>
    </div>

    <section className="library-heading">
      <div><p className="eyebrow">Practice</p><h1>{selected?.name||"Practice library"}</h1><p>{selected?.description||"Six reasoning categories. Real questions. Clear solutions."}</p></div>
      <div className="library-total"><strong>{filtered.length}</strong><span>Total {filtered.length===1?"test":"tests"}</span></div>
    </section>

    <section className="test-list" aria-label="Practice tests">
      {visible.map((t:any,index:number)=>{
        const qs=questionsForTest(t.test_id);
        const attempt=latest(t.test_id);
        const starred=stars.includes(t.test_id);
        const number=(currentPage-1)*perPage+index+1;
        return <article key={t.test_id} className="test-row">
          <span className="test-number">{String(number).padStart(2,"0")}</span>
          <div className="test-info"><h2>{t.title.replaceAll("_"," ")}</h2><p>{qs.length} questions <i>·</i> {qs.length} min{attempt?.completedAt?<><i>·</i> Latest attempt saved</>:attempt?<><i>·</i> In progress</>:null}</p></div>
          <div className="test-actions"><button type="button" onClick={()=>{toggleStarredTest(t.test_id);setStars(getStarredTests())}} className="star-button" aria-label={starred?"Unstar test":"Star test"}>{starred?"★":"☆"}</button><Link href={`/tests/${t.test_id}`} className="start-button">Start →</Link></div>
        </article>
      })}
      {!visible.length&&<div className="empty-state">No practice sets match this search.</div>}
    </section>

    {filtered.length>0&&<div className="library-pagination">
      <span>Showing {start}–{end} of {filtered.length} tests</span>
      <div className="page-controls">
        <button type="button" disabled={currentPage===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>←</button>
        {Array.from({length:pageCount},(_,i)=>i+1).slice(0,7).map(n=><button key={n} type="button" onClick={()=>setPage(n)} className={currentPage===n?"active":""}>{n}</button>)}
        {pageCount>7&&<span>…</span>}
        <button type="button" disabled={currentPage===pageCount} onClick={()=>setPage(p=>Math.min(pageCount,p+1))}>→</button>
      </div>
    </div>}

    <style jsx>{`
      .practice-library-page{padding-top:2px;padding-bottom:28px}
      .practice-toolbar{display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid #e7e5de;padding:0 0 14px}
      .category-nav{display:flex;align-items:center;gap:18px;overflow-x:auto;scrollbar-width:none;white-space:nowrap}.category-nav::-webkit-scrollbar{display:none}
      .category-nav button{border:0;background:none;padding:4px 0;color:#a09c94;font-size:10px;cursor:pointer}.category-nav button.active{color:#292824;font-weight:700}
      .practice-search{display:flex;align-items:center;gap:8px;min-width:205px;padding:8px 11px;border:1px solid #e4e1d9;border-radius:999px;background:#fffdfa}.practice-search span{font-size:15px;color:#99958d}.practice-search input{width:100%;border:0;outline:0;background:transparent;font-size:11px;color:#35332f}.practice-search input::placeholder{color:#aaa69e}
      .library-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:30px;padding:38px 0 24px}.library-heading h1{margin-top:5px;font-size:clamp(34px,5vw,56px);font-weight:500;line-height:1;letter-spacing:-.055em;color:#272622}.library-heading p:not(.eyebrow){max-width:560px;margin-top:10px;font-size:12px;line-height:1.5;color:#99958e}.library-total{display:flex;align-items:baseline;gap:9px;padding-bottom:4px;white-space:nowrap}.library-total strong{font-size:26px;font-weight:500;letter-spacing:-.04em}.library-total span{font-size:10px;color:#99958e}
      .test-list{border-top:1px solid #dcd9d1}.test-row{display:grid;grid-template-columns:52px minmax(0,1fr) auto;align-items:center;gap:18px;min-height:82px;border-bottom:1px solid #e7e5de}.test-number{font-size:10px;letter-spacing:.12em;color:#aaa69e}.test-info h2{font-size:15px;font-weight:500;letter-spacing:-.025em;color:#34322e}.test-info p{margin-top:5px;font-size:10px;color:#aaa69e}.test-info i{font-style:normal;padding:0 5px;color:#c4c0b8}.test-actions{display:flex;align-items:center;gap:12px}.star-button{width:30px;height:30px;border:0;background:transparent;color:#817d75;font-size:19px;cursor:pointer}.start-button{display:flex;align-items:center;justify-content:center;min-width:72px;padding:8px 13px;border-radius:999px;background:#f2d86d;color:#312f29;font-size:10px;font-weight:700;text-decoration:none}.empty-state{padding:60px 20px;text-align:center;font-size:12px;color:#aaa69e}
      .library-pagination{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-top:18px;font-size:10px;color:#aaa69e}.page-controls{display:flex;align-items:center;gap:4px}.page-controls button{min-width:27px;height:27px;border:0;border-radius:50%;background:transparent;color:#858078;font-size:10px;cursor:pointer}.page-controls button.active{background:#f2efe8;color:#272521;font-weight:700}.page-controls button:disabled{opacity:.3;cursor:default}.page-controls span{padding:0 3px}
      @media(max-width:760px){.practice-toolbar{display:block}.category-nav{padding-bottom:11px}.practice-search{min-width:0}.library-heading{padding:28px 0 20px}.library-heading h1{font-size:38px}.library-total{display:none}.test-row{grid-template-columns:34px minmax(0,1fr) auto;gap:10px;min-height:76px}.test-actions{gap:4px}.star-button{width:25px}.start-button{min-width:62px;padding:8px 10px}.library-pagination{display:block}.page-controls{margin-top:12px}}
    `}</style>
  </div>;
}

export default function Practice(){return <Suspense fallback={<div className="app-page"><p className="eyebrow">Practice</p><h1 className="section-title">Loading library…</h1></div>}><PracticeContent/></Suspense>}
