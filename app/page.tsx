"use client";

import Link from "next/link";
import {appCatalog,questionsForTest} from "../lib/data";

const tones=["tone-pink","tone-lavender","tone-lime","tone-mint","tone-sky","tone-peach"];

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

    <div id="practice-by-test"><TestFamilySection/></div>

    <footer className="home-footer border-t border-[#e7e5de] pt-5 text-xs text-[#aaa7a0]">
      <b className="text-[#44433f]">{appCatalog.stats.test_count}</b> curated tests
      <span className="ml-5"><b className="text-[#44433f]">{appCatalog.stats.question_count.toLocaleString()}</b> questions indexed</span>
    </footer>

    <style jsx>{`
      .home-page{padding-top:0;padding-bottom:42px}
      .home-page .editorial-hero{margin-bottom:2px}
      .home-page .hero-copy{margin-top:-4px}
      .home-page .section-head{margin-top:20px;margin-bottom:15px}
      .home-page .practice-grid{gap:14px}
      .home-page .practice-card{min-height:190px;height:190px;padding:18px 20px 16px;display:block}
      .home-page .practice-card h3{margin-top:20px;font-size:20px}
      .home-page .practice-card p{margin-top:7px;line-height:1.5}
      .home-page .practice-meta{right:auto;bottom:17px;left:20px;gap:18px}
      .home-page .practice-arrow{right:20px;bottom:14px}
      .home-page .home-footer{padding-top:22px!important;margin-top:22px}
      @media(max-width:900px){
        .home-page .editorial-hero{margin-bottom:0}
        .home-page .practice-card{min-height:175px;height:175px}
      }
    `}</style>
  </div>
}
