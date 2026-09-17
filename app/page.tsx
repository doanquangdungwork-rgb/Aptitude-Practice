"use client";

import Link from "next/link";
import {appCatalog,questionsForTest} from "../lib/data";

const tones=["tone-pink","tone-lavender","tone-lime","tone-mint","tone-sky","tone-peach"];

function testsForPillar(pillarId:string){
  return appCatalog.tests.filter((t:any)=>t.pillar===pillarId || (pillarId==="deductive" && t.subtype==="deductive_logical"));
}

export default function Home(){
  const totalQuestions=appCatalog.tests.reduce((sum:number,t:any)=>sum+questionsForTest(t.test_id).length,0);
  return <div className="app-page home-page">
    <section className="editorial-hero">
      <div className="hero-copy">
        <p className="hero-label">Let's practice</p>
        <h1 className="hero-title"><span className="soft">small practice</span><br/><span className="strong">bigger progress.</span></h1>
        <p className="hero-lede">Short, image-based aptitude tests to build real-world skills.</p>
        <div className="hero-actions"><Link href="/practice" className="primary-action">Start practicing →</Link><Link href="#practice-library" className="secondary-action">Explore the library</Link></div>
      </div>
      <div className="hero-note" aria-hidden="true"><div className="hero-hand">Progress<br/>lives here.</div><div className="hero-smiley">☺</div><div className="sticky sticky-one">PRACTICE</div><div className="sticky sticky-two">LEARN</div><div className="sticky sticky-three">GROW</div><div className="hero-arrow">↗</div></div>
    </section>

    <section id="practice-library" className="library-section">
      <div className="section-head"><div><p className="eyebrow">Practice library</p><h2 className="section-title">Choose a practice set</h2><p className="section-note">Six reasoning categories. Real questions. Clear solutions.</p></div></div>
      <div className="practice-grid">
        {appCatalog.pillars.map((p:any,i:number)=>{
          const tests=testsForPillar(p.id);
          const questionCount=tests.reduce((sum:number,t:any)=>sum+questionsForTest(t.test_id).length,0);
          return <Link key={p.id} href={`/practice?pillar=${p.id}`} className={`practice-card ${tones[i%tones.length]} text-left`}>
            <span className="practice-index">{String(i+1).padStart(2,"0")}</span>
            <div className="practice-card-main"><div><h3>{p.name}</h3><p>{p.description}</p></div><span className="practice-count">{tests.length} {tests.length===1?"source test":"source tests"}<br/>{questionCount.toLocaleString()} questions</span></div>
            <span className="practice-arrow">→</span>
          </Link>
        })}
      </div>
    </section>

    <section className="mixed-sprint">
      <div><p className="eyebrow">Mixed sprint</p><h2 className="section-title">30 mixed questions across six core skills.</h2><p className="mixed-skills">Deductive Reasoning · Diagrammatic Reasoning · Logical Reasoning · Numerical Reasoning · Situational Judgement · Verbal Reasoning</p></div>
      <div className="mixed-meta"><span>20-minute timed session</span><Link href="/practice" className="yellow-button">Start Mixed Sprint →</Link></div>
    </section>

    <footer className="home-footer border-t border-[#e7e5de] pt-5 text-xs text-[#aaa7a0]"><b className="text-[#44433f]">{appCatalog.stats.test_count}</b> curated tests<span className="ml-5"><b className="text-[#44433f]">{totalQuestions.toLocaleString()}</b> questions indexed</span></footer>
    <style jsx>{`
      .home-page{padding-top:0;padding-bottom:20px}
      .home-page .editorial-hero{transform:scale(.92);transform-origin:top center;margin-bottom:-44px}
      .home-page .library-section{margin-top:0}
      .home-page .section-head{margin-bottom:18px}
      .home-page .section-note{margin-top:7px;font-size:12px;color:#99968f}
      .home-page .practice-grid{gap:12px}
      .home-page .practice-card{min-height:118px;padding:13px 16px 12px;display:flex;flex-direction:column;position:relative;text-decoration:none}
      .home-page .practice-card-main{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-top:10px;padding-right:32px}
      .home-page .practice-card h3{font-size:18px}
      .home-page .practice-card p{max-width:390px;margin-top:5px;line-height:1.35;font-size:11px}
      .home-page .practice-count{flex:none;text-align:right;font-size:10px;line-height:1.45;color:#7f7b73}
      .home-page .practice-arrow{right:13px;bottom:12px;width:25px;height:25px}
      .mixed-sprint{margin-top:34px;padding:24px 26px;border:1px solid #e7e5de;border-radius:18px;background:#fffdfa;display:flex;align-items:flex-end;justify-content:space-between;gap:30px}
      .mixed-sprint .section-title{max-width:580px;font-size:25px}
      .mixed-skills{margin-top:10px;max-width:680px;font-size:11px;line-height:1.7;color:#99968f}
      .mixed-meta{display:flex;flex-direction:column;align-items:flex-end;gap:14px;white-space:nowrap;font-size:10px;color:#8d8981}
      .home-footer{margin-top:22px}
      @media(max-width:900px){.home-page .editorial-hero{transform:none;margin-bottom:0}.mixed-sprint{display:block}.mixed-meta{align-items:flex-start;margin-top:18px}.home-page .practice-card-main{display:block}.home-page .practice-count{text-align:left;display:block;margin-top:8px}.home-page .practice-card{min-height:125px}}
    `}</style>
  </div>;
}
