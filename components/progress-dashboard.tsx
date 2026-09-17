"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { appCatalog, questionsForTest } from "../lib/data";
import { getAttempts, getBookmarks, getPracticeDays, getWrongQuestions } from "../lib/progress";
import { supabase } from "../lib/supabase";

const norm=(v:unknown)=>String(v??"").trim().toLowerCase();
const pct=(n:number,d:number)=>d?Math.round((n/d)*100):0;
const pad=(n:number)=>String(n).padStart(2,"0");
const toDateKey=(date:Date)=>`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
const monthKey=(date:Date)=>`${date.getFullYear()}-${pad(date.getMonth()+1)}`;
const monthLabel=(key:string)=>{const [y,m]=key.split("-").map(Number);return new Date(y,m-1,1).toLocaleDateString("en-US",{month:"long"});};
const yearFromKey=(key:string)=>Number(key.slice(0,4));

function currentStreak(days:string[]){
  const set=new Set(days);
  const today=new Date();
  let cursor=new Date(today.getFullYear(),today.getMonth(),today.getDate());
  if(!set.has(toDateKey(cursor))) cursor.setDate(cursor.getDate()-1);
  let streak=0;
  while(set.has(toDateKey(cursor))){streak++;cursor.setDate(cursor.getDate()-1);}
  return streak;
}

function StreakChart({userId}:{userId:string}){
  const now=new Date();
  const [selectedMonth,setSelectedMonth]=useState(monthKey(now));
  const [days,setDays]=useState<string[]>([]);
  useEffect(()=>setDays(getPracticeDays(userId)),[userId]);
  const years=useMemo(()=>{const found=days.map(yearFromKey);return Array.from(new Set([...found,now.getFullYear()])).sort((a,b)=>b-a)},[days]);
  const [year,month]=selectedMonth.split("-").map(Number);
  const daysInMonth=new Date(year,month,0).getDate();
  const active=new Set(days.filter(d=>d.startsWith(selectedMonth)));
  const streak=currentStreak(days);
  const completedDays=active.size;

  return <section className="dash-panel dash-panel--streak">
    <div className="dash-panel-inner">
      <div className="dash-head">
        <div>
          <p className="dash-kicker">01 · Consistency</p>
          <div className="mt-3 flex items-end gap-3"><span className="dash-streak-number">{streak}</span><span className="dash-streak-unit">day streak</span></div>
          <p className="dash-copy">Finish at least one test in a day to keep your streak alive.</p>
        </div>
        <div className="dash-head-right">
          <select value={month} onChange={e=>setSelectedMonth(`${year}-${pad(Number(e.target.value))}`)} className="dash-select"><option value={1}>January</option><option value={2}>February</option><option value={3}>March</option><option value={4}>April</option><option value={5}>May</option><option value={6}>June</option><option value={7}>July</option><option value={8}>August</option><option value={9}>September</option><option value={10}>October</option><option value={11}>November</option><option value={12}>December</option></select>
          <select value={year} onChange={e=>setSelectedMonth(`${e.target.value}-${pad(month)}`)} className="dash-select">{years.map(y=><option key={y} value={y}>{y}</option>)}</select>
        </div>
      </div>
      <div className="dash-calendar">
        <div className="dash-calendar-head"><div><div className="dash-calendar-title">{monthLabel(selectedMonth)} {year}</div><div className="dash-calendar-meta">{completedDays} of {daysInMonth} days active</div></div><div className="dash-calendar-legend"><i/>Practice day</div></div>
        <div className="dash-week"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
        <div className="dash-days">
          {Array.from({length:daysInMonth},(_,i)=>{const day=i+1;const date=new Date(year,month-1,day);const activeDay=active.has(toDateKey(date));return <div key={day} className="dash-day"><span className={`dash-dot ${activeDay?"active":""}`} title={`${monthLabel(selectedMonth)} ${day}${activeDay?" · completed":" · no test completed"}`}/><span className={`dash-day-number ${activeDay?"active":""}`}>{day}</span></div>})}
        </div>
        <div className="dash-foot"><span><b>{completedDays}</b> active days</span><span><b>{days.length}</b> total practice days</span></div>
      </div>
    </div>
  </section>;
}

export default function ProgressDashboard({compact=false}:{compact?:boolean}){
  const [attempts,setAttempts]=useState<any[]>([]);
  const [bookmarks,setBookmarks]=useState(0);
  const [wrong,setWrong]=useState(0);
  const [userId,setUserId]=useState("");

  useEffect(()=>{
    setAttempts(getAttempts());
    setBookmarks(getBookmarks().length);
    setWrong(getWrongQuestions().length);
    supabase?.auth.getSession().then(({data})=>setUserId(data.session?.user?.id||""));
    const sub=supabase?.auth.onAuthStateChange((_e,session)=>setUserId(session?.user?.id||"")).data.subscription;
    return()=>sub?.unsubscribe();
  },[]);

  const latest=useMemo(()=>{
    const map=new Map<string,any>();
    attempts.filter(a=>a.completedAt).sort((a,b)=>new Date(b.completedAt).getTime()-new Date(a.completedAt).getTime()).forEach(a=>{if(!map.has(a.testId))map.set(a.testId,a)});
    return map;
  },[attempts]);
  const completed=[...latest.values()];
  const stats=useMemo(()=>{
    let answered=0,correct=0;
    latest.forEach(a=>questionsForTest(a.testId).forEach((q:any)=>{if(a.answers?.[q.id]){answered++;if(norm(a.answers[q.id])===norm(q.a))correct++;}}));
    const total=appCatalog.stats.question_count;
    return {answered,correct,accuracy:pct(correct,answered),coverage:pct(answered,total)};
  },[latest]);
  const pillars=useMemo(()=>appCatalog.pillars.map((p:any)=>{
    let answered=0,correct=0;
    latest.forEach((a:any)=>{const test=appCatalog.tests.find((t:any)=>t.test_id===a.testId);if(test?.pillar===p.id)questionsForTest(a.testId).forEach((q:any)=>{if(a.answers?.[q.id]){answered++;if(norm(a.answers[q.id])===norm(q.a))correct++;}})});
    return {...p,answered,correct,accuracy:pct(correct,answered)};
  }),[latest]);

  if(compact)return <section className="progress-compact">
    <div className="progress-compact-head">
      <div>
        <p className="eyebrow">Your progress</p>
        <h2 className="progress-compact-title">Keep your momentum</h2>
        <p className="progress-compact-copy">A little practice adds up. Keep going and watch your progress build.</p>
      </div>
      <Link href="/dashboard" className="progress-compact-link">Full dashboard <span>↗</span></Link>
    </div>
    <div className="progress-compact-stats">
      <div className="progress-compact-stat progress-stat-rose">
        <span className="progress-stat-label">Tests completed</span>
        <strong>{completed.length}<small>/{appCatalog.tests.length}</small></strong>
        <span className="progress-stat-note">tests finished</span>
      </div>
      <div className="progress-compact-stat progress-stat-blue">
        <span className="progress-stat-label">Accuracy</span>
        <strong>{stats.accuracy}<small>%</small></strong>
        <span className="progress-stat-note">across answered questions</span>
      </div>
      <div className="progress-compact-stat progress-stat-mint">
        <span className="progress-stat-label">Questions answered</span>
        <strong>{stats.answered}<small>/{appCatalog.stats.question_count}</small></strong>
        <span className="progress-stat-note">of the question bank</span>
      </div>
    </div>
    <style jsx>{`
      .progress-compact{position:relative;overflow:hidden;border:1px solid #e5e1d8;border-radius:28px;background:#fffdfa;padding:34px 36px;box-shadow:0 10px 35px rgba(45,41,34,.045)}
      .progress-compact:before{content:"";position:absolute;width:220px;height:220px;right:-85px;top:-115px;border-radius:50%;background:rgba(239,218,226,.34);pointer-events:none}
      .progress-compact-head{position:relative;display:flex;align-items:flex-end;justify-content:space-between;gap:24px}
      .progress-compact-title{margin-top:7px;font-size:30px;line-height:1.05;font-weight:500;letter-spacing:-.045em;color:#292825}
      .progress-compact-copy{margin-top:10px;max-width:470px;font-size:12px;line-height:1.6;color:#99968f}
      .progress-compact-link{display:inline-flex;align-items:center;gap:7px;white-space:nowrap;font-size:11px;color:#65615a;text-decoration:none;border-bottom:1px solid #d8d3ca;padding-bottom:3px;transition:color .15s ease,border-color .15s ease}
      .progress-compact-link:hover{color:#292825;border-color:#292825}
      .progress-compact-link span{font-size:14px;line-height:1}
      .progress-compact-stats{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:28px}
      .progress-compact-stat{position:relative;min-height:142px;border-radius:18px;padding:20px 21px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden}
      .progress-compact-stat:after{content:"";position:absolute;width:90px;height:90px;right:-28px;bottom:-35px;border-radius:50%;border:1px solid rgba(255,255,255,.55)}
      .progress-stat-rose{background:#f5e6eb}.progress-stat-blue{background:#e7edf5}.progress-stat-mint{background:#e6f0ea}
      .progress-stat-label{font-size:10px;letter-spacing:.04em;color:#77736c}
      .progress-compact-stat strong{font-size:38px;line-height:1;font-weight:500;letter-spacing:-.055em;color:#302e2a}
      .progress-compact-stat strong small{font-size:17px;font-weight:400;letter-spacing:-.02em;color:#858078}
      .progress-stat-note{font-size:10px;color:#99968f}
      @media(max-width:700px){.progress-compact{padding:27px 22px;border-radius:23px}.progress-compact-head{display:block}.progress-compact-link{margin-top:17px}.progress-compact-stats{grid-template-columns:1fr}.progress-compact-stat{min-height:118px}}
    `}</style>
  </section>;

  return <div className="editorial-dashboard">
    {userId?<StreakChart userId={userId}/>:<section className="dash-panel dash-panel--streak"><div className="dash-panel-inner"><p className="dash-kicker">01 · Consistency</p><h2 className="dash-title">Build your practice streak.</h2><p className="dash-copy max-w-2xl">Sign in with Google and finish at least one test on a day to start collecting your daily dots and streak.</p><Link href="/auth" className="dash-guest">Sign in →</Link></div></section>}

    <section className="dash-panel dash-panel--overview">
      <div className="dash-panel-inner">
        <div className="dash-overview"><div><p className="dash-kicker">02 · Overview</p><h1 className="dash-title">Your progress.</h1><p className="dash-copy">A clear view of completion, accuracy and where to focus next.</p></div><div className="dash-coverage"><div className="dash-coverage-number">{stats.coverage}%</div><div className="dash-coverage-label">of question bank answered</div></div></div>
        <div className="dash-bar"><div className="dash-bar-fill" style={{width:`${stats.coverage}%`}}/></div>
        <div className="dash-stat-grid"><div className="dash-stat"><div className="dash-stat-value">{completed.length}/{appCatalog.tests.length}</div><div className="dash-stat-label">Tests completed</div></div><div className="dash-stat"><div className="dash-stat-value">{stats.answered}/{appCatalog.stats.question_count}</div><div className="dash-stat-label">Questions answered</div></div><div className="dash-stat"><div className="dash-stat-value">{stats.accuracy}%</div><div className="dash-stat-label">Overall accuracy</div></div><div className="dash-stat"><div className="dash-stat-value">{wrong}</div><div className="dash-stat-label">Wrong to review</div></div></div>
      </div>
    </section>

    <section className="dash-panel dash-panel--pillars"><div className="dash-panel-inner"><div className="dash-head"><div><p className="dash-kicker">03 · Reasoning profile</p><h2 className="dash-title">Strengths & gaps.</h2></div><span className="dash-calendar-meta">Answered · accuracy</span></div><div className="dash-pillar-list">{pillars.map((p:any)=><div key={p.id} className="dash-pillar"><div className="dash-pillar-head"><div><span className="dash-pillar-name">{p.name}</span><span className="dash-pillar-meta"> · {p.answered} answered</span></div><span className="dash-pillar-score">{p.accuracy}%</span></div><div className="dash-pillar-track"><div className="dash-pillar-fill" style={{width:`${p.accuracy}%`}}/></div></div>)}</div></div></section>

    <section className="dash-panel dash-panel--tests"><div className="dash-panel-inner"><div className="dash-head"><div><p className="dash-kicker">04 · Practice library</p><h2 className="dash-title">30-test progress.</h2></div><Link href="/tests" className="dash-link">Practice tests →</Link></div><div className="dash-test-list">{appCatalog.tests.map((t:any,i:number)=>{const a=latest.get(t.test_id);const qs=questionsForTest(t.test_id);let c=0,ans=0;if(a)qs.forEach((q:any)=>{if(a.answers?.[q.id]){ans++;if(norm(a.answers[q.id])===norm(q.a))c++;}});const accuracy=pct(c,ans);return <Link href={`/tests/${t.test_id}`} key={t.test_id} className="dash-test-row"><span className="dash-test-number">{String(i+1).padStart(2,"0")}</span><div><div className="dash-test-name">{t.title.replaceAll("_"," ")}</div><div className="dash-test-meta">{ans?`${c}/${qs.length} correct · ${accuracy}% accuracy`:"Not started"}</div><div className="dash-test-track"><div className="dash-test-fill" style={{width:`${a?accuracy:0}%`}}/></div></div><span className={`dash-test-status ${a?"done":""}`}>{a?"Completed":"Not started"}</span></Link>})}</div></div></section>

    <div className="dash-bottom-grid"><Link href="/bookmarks" className="dash-action"><div className="dash-action-kicker">05 · Saved</div><div className="dash-action-title">{bookmarks} bookmarks.</div><p className="dash-action-copy">Questions you chose to revisit.</p></Link><Link href="/tests" className="dash-action"><div className="dash-action-kicker">06 · Next</div><div className="dash-action-title">Continue practicing.</div><p className="dash-action-copy">Pick an unfinished test and keep going.</p></Link></div>
  </div>;
}
