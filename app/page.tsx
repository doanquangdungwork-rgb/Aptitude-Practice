"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import {appCatalog} from "../lib/data";
import ProgressDashboard from "../components/progress-dashboard";

const categories=[
  {label:"All",value:"all"},
  {label:"Verbal Reasoning",value:"verbal"},
  {label:"Numerical Reasoning",value:"numerical"},
  {label:"Logical Reasoning",value:"logical"},
  {label:"Diagrammatic Reasoning",value:"diagrammatic"},
  {label:"Deductive Reasoning",value:"deductive"},
  {label:"Situational Judgement",value:"situational_judgement"},
];

const pillarNames:Record<string,string>={
  verbal:"Verbal Reasoning",
  numerical:"Numerical Reasoning",
  logical:"Logical Reasoning",
  diagrammatic:"Diagrammatic Reasoning",
  deductive:"Deductive Reasoning",
  situational_judgement:"Situational Judgement",
};

const tones=["tone-pink","tone-lavender","tone-lime","tone-mint","tone-sky","tone-peach"];

export default function Home(){
  const [category,setCategory]=useState("all");
  const [query,setQuery]=useState("");

  const filteredTests=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return appCatalog.tests.filter((test:any)=>{
      const matchesCategory=category==="all"
        || (category==="deductive" ? test.pillar==="logical" && test.subtype==="deductive_logical" : test.pillar===category);
      const matchesSearch=!q || `${test.title} ${test.test_id} ${test.pillar} ${test.subtype}`.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  },[category,query]);

  return <div className="app-page">
    <section className="editorial-hero">
      <div className="hero-copy">
        <p className="hero-label">Let's practice</p>
        <h1 className="hero-title"><span className="soft">small practice</span><br/><span className="strong">bigger progress.</span></h1>
        <p className="hero-lede">Short, image-based aptitude tests to build real-world skills.</p>
        <div className="hero-actions"><Link href="/tests" className="primary-action">Start practicing →</Link><Link href="/practice" className="secondary-action">Explore by type</Link></div>
      </div>
      <div className="hero-note" aria-hidden="true"><div className="hero-hand">Progress<br/>lives here.</div><div className="hero-smiley">☺</div><div className="sticky sticky-one">PRACTICE</div><div className="sticky sticky-two">LEARN</div><div className="sticky sticky-three">GROW</div><div className="hero-arrow">↗</div></div>
    </section>

    <nav className="category-nav" aria-label="Filter practice sets">
      <div className="category-buttons">
        {categories.map(c=><button key={c.value} type="button" onClick={()=>setCategory(c.value)} className={category===c.value?"active":""}>{c.label}</button>)}
      </div>
      <div className="search-wrap"><span>⌕</span><input aria-label="Search practice sets" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search practice sets..."/><button type="button" className="search-clear" onClick={()=>setQuery("")} aria-label="Clear search">{query?"×":""}</button></div>
    </nav>

    <section>
      <div className="section-head"><div><p className="eyebrow">Practice library</p><h2 className="section-title">Choose a practice set</h2></div><p className="section-note">{filteredTests.length} of {appCatalog.tests.length} sets shown.<br/>Filter by reasoning or search by name.</p></div>
      {filteredTests.length===0 ? <div className="empty-library"><div className="text-2xl font-medium">No practice sets found.</div><p>Try another category or search term.</p></div> : <div className="practice-grid">
        {filteredTests.map((test:any,i:number)=><Link key={test.test_id} href={`/tests/${test.test_id}`} className={`practice-card ${tones[i%tones.length]}`}>
          <span className="practice-index">{test.test_id.replace("TEST_","").padStart(2,"0")}</span>
          <span className="practice-subtype">{category==="all"?pillarNames[test.pillar]||test.pillar:pillarNames[category]||test.pillar}</span>
          <h3>{test.title.replaceAll("_"," ")}</h3>
          <p>{test.question_count} questions · {test.subtype.replaceAll("_"," ")}</p>
          <div className="practice-meta"><span>▧ {test.question_count}</span><span>◷ practice</span></div><span className="practice-arrow">→</span>
        </Link>)}
      </div>}
    </section>

    <section className="mt-14"><ProgressDashboard compact/></section>
    <footer className="mt-14 border-t border-[#e7e5de] pt-6 text-xs text-[#aaa7a0]"><b className="text-[#44433f]">{appCatalog.stats.test_count}</b> curated tests <span className="ml-5"><b className="text-[#44433f]">{appCatalog.stats.question_count.toLocaleString()}</b> questions indexed</span></footer>
  </div>
}
