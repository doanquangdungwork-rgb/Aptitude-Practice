"use client";

import Link from "next/link";
import {useState} from "react";
import {appCatalog,questionsForTest} from "../lib/data";

const tones=["tone-pink","tone-lavender","tone-lime","tone-mint","tone-sky","tone-peach"];

function CategoryNav(){
  const [query,setQuery]=useState("");
  return <div className="library-filter-bar home-library-filter-bar">
    <div className="library-filter-top">
      <div className="library-index-count">{appCatalog.stats.question_count.toLocaleString()} questions indexed</div>
      <label className="search-wrap home-search-wrap">
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search practice sets..." aria-label="Search practice sets" />
        {query&&<button type="button" className="search-clear" onClick={()=>setQuery("")} aria-label="Clear search">×</button>}
      </label>
    </div>
    <div className="category-buttons home-category-buttons">
      <Link href="/practice" className="active">All</Link>
      {appCatalog.pillars.map((p:any)=><Link key={p.id} href={`/practice?pillar=${p.id}`}>{p.name}</Link>)}
    </div>
  </div>
}

function TestFamilySection(){
  return <section>
    <div className="section-head">
      <div>
        <p className="eyebrow">Practice library</p>
        <h2 className="section-title">Choose a practice set</h2>
      </div>
      <p className="section-note">Six reasoning categories.<br/>Real questions. Clear solutions.</p>
    </div>

    <div className="practice-grid">
      {appCatalog.pillars.map((p:any,i:number)=>{
        const tests=appCatalog.tests.filter((t:any)=>t.pillar===p.id || (t.subtype==="deductive_logical" && p.id==="deductive"));
        const questionCount=tests.reduce((sum:number,t:any)=>sum+questionsForTest(t.test_id).length,0);
        return <Link key={p.id} href={`/practice?pillar=${p.id}`} className={`practice-card ${tones[i%tones.length]} text-left`}>
          <span className="practice-index">{String(i+1).padStart(2,"0")}</span>
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          <div className="practice-meta"><span>{tests.length} source {tests.length===1?"test":"tests"}</span><span>{questionCount.toLocaleString()} questions</span></div>
          <span className="practice-arrow">→</span>
        </Link>
      })}
    </div>
  </section>
}

export default function Home(){
  return <div className="app-page home-page">
    <section className="editorial-hero">
      <div className="hero-copy">
        <p className="hero-label">Let's practice</p>
        <h1 className="hero-title"><span className="soft">small practice</span><br/><span className="strong">bigger progress.</span></h1>
        <p className="hero-lede">Short, image-based aptitude tests to build real-world skills.</p>
        <div className="hero-actions">
          <Link href="/practice" className="primary-action">Start practicing →</Link>
          <Link href="#practice-by-test" className="secondary-action">Explore the library</Link>
        </div>
      </div>
      <div className="hero-note" aria-hidden="true">
        <div className="hero-hand">Progress<br/>lives here.</div>
        <div className="hero-smiley">☺</div>
        <div className="sticky sticky-one">PRACTICE</div>
        <div className="sticky sticky-two">LEARN</div>
        <div className="sticky sticky-three">GROW</div>
        <div className="hero-arrow">↗</div>
      </div>
    </section>

    <CategoryNav/>
    <div id="practice-by-test"><TestFamilySection/></div>

    <footer className="home-footer border-t border-[#e7e5de] pt-5 text-xs text-[#aaa7a0]">
      <b className="text-[#44433f]">{appCatalog.stats.test_count}</b> curated tests
      <span className="ml-5"><b className="text-[#44433f]">{appCatalog.stats.question_count.toLocaleString()}</b> questions indexed</span>
    </footer>

    <style jsx>{`
      .home-page{padding-top:0;padding-bottom:18px}
      .home-page .editorial-hero{min-height:315px;padding:34px 0 26px;margin-bottom:0}
      .home-page .hero-copy{margin-top:-4px}
      .home-page .hero-title{font-size:clamp(54px,5.4vw,78px)}
      .home-page .hero-lede{margin-top:18px}
      .home-page .hero-actions{margin-top:20px}
      .home-page .hero-note{right:58px;transform:translateY(-50%) scale(.88)}

      /* The homepage nav intentionally mirrors Practice by Type. */
      .home-page .home-category-nav{padding-bottom:12px;border-bottom:1px solid var(--line);overflow:hidden}
      .home-page .home-category-buttons{gap:25px;overflow:hidden;white-space:nowrap}
      .home-page .home-category-buttons a{display:block;flex:0 0 auto;white-space:nowrap;border:0;background:transparent;padding:0 0 9px;color:#aaa7a0;font-size:13px;line-height:1.2}
      .home-page .home-category-buttons a.active{color:#2a2b28;border-bottom:1px solid #2a2b28}
      .home-page .home-search-wrap{flex:0 0 420px}

      .home-page .section-head{margin-top:17px;margin-bottom:11px}
      .home-page .section-title{font-size:25px}
      .home-page .practice-grid{gap:10px}
      .home-page .practice-card{min-height:138px;height:138px;padding:13px 16px 12px;border-radius:12px}
      .home-page .practice-card h3{margin-top:12px;font-size:17px}
      .home-page .practice-card p{margin-top:4px;font-size:10.5px;line-height:1.4}
      .home-page .practice-card:after{right:-23px;top:13px;width:68px;height:56px}
      .home-page .practice-meta{left:16px;bottom:11px;gap:14px;font-size:9px}
      .home-page .practice-arrow{right:13px;bottom:9px;width:27px;height:27px}
      .home-page .home-footer{padding-top:10px!important;margin-top:10px}
      @media(max-width:1200px){
        .home-page .home-search-wrap{flex-basis:260px}
        .home-page .home-category-buttons{gap:18px}
      }
      @media(max-width:900px){
        .home-page .editorial-hero{min-height:auto;padding:42px 0 34px}
        .home-page .hero-note{position:relative;right:auto;top:auto;transform:scale(.9);margin:4px auto -20px}
        .home-page .home-category-nav{overflow:visible}
        .home-page .home-category-buttons{width:100%;flex:none;overflow-x:auto;overflow-y:hidden;padding-bottom:2px}
        .home-page .home-search-wrap{width:100%;flex-basis:auto}
        .home-page .practice-card{min-height:150px;height:150px}
      }
    `}</style>
  </div>
}
