"use client";

import Link from "next/link";
import {appCatalog} from "../lib/data";
import ProgressDashboard from "../components/progress-dashboard";

const tones=["tone-pink","tone-lavender","tone-lime","tone-mint","tone-sky","tone-peach"];

export default function Home(){
  return <div className="app-page">
    <section className="editorial-hero">
      <div className="hero-copy">
        <p className="hero-label">Let's practice</p>
        <h1 className="hero-title"><span className="soft">small practice</span><br/><span className="strong">bigger progress.</span></h1>
        <p className="hero-lede">Short, image-based aptitude tests to build real-world skills.</p>
        <div className="hero-actions"><Link href="/practice" className="primary-action">Start practicing →</Link><Link href="/practice" className="secondary-action">Explore by type</Link></div>
      </div>
      <div className="hero-note" aria-hidden="true"><div className="hero-hand">Progress<br/>lives here.</div><div className="hero-smiley">☺</div><div className="sticky sticky-one">PRACTICE</div><div className="sticky sticky-two">LEARN</div><div className="sticky sticky-three">GROW</div><div className="hero-arrow">↗</div></div>
    </section>

    <section>
      <div className="section-head">
        <div>
          <p className="eyebrow">Practice by test</p>
          <h2 className="section-title">Choose a test family</h2>
        </div>
        <p className="section-note">Browse the practice tests inside each reasoning family.<br/>Choose a family to see its smaller tests.</p>
      </div>

      <div className="practice-grid">
        {appCatalog.pillars.map((pillar:any,i:number)=><Link key={pillar.id} href={`/practice?pillar=${encodeURIComponent(pillar.id)}`} className={`practice-card ${tones[i%tones.length]}`}>
          <span className="practice-index">{String(i+1).padStart(2,"0")}</span>
          <h3>{pillar.name}</h3>
          <p>{pillar.description}</p>
          <span className="practice-arrow">→</span>
        </Link>)}
      </div>
    </section>

    <section className="mt-14"><ProgressDashboard compact/></section>
    <footer className="mt-14 border-t border-[#e7e5de] pt-6 text-xs text-[#aaa7a0]">
      <b className="text-[#44433f]">{appCatalog.stats.test_count}</b> curated tests
      <span className="ml-5"><b className="text-[#44433f]">{appCatalog.stats.question_count.toLocaleString()}</b> questions indexed</span>
    </footer>
  </div>
}
