"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { appCatalog, questionsForTest, pillarMap } from "../../../lib/data";
import { completeAttempt, getAttempt, getBookmarks, getCompletedAttempt, getWrongQuestions, recordPracticeDay, saveAttempt, setWrongQuestions, toggleBookmark } from "../../../lib/progress";
import { supabase } from "../../../lib/supabase";

export default function TestPage() {
  const { testId } = useParams<{ testId: string }>();
  const router = useRouter();
  const test = appCatalog.tests.find((x: any) => x.test_id === testId);
  const qs = useMemo(() => questionsForTest(testId), [testId]);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptId, setAttemptId] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const saved = getAttempt(testId);
    const done = getCompletedAttempt(testId);
    if (saved) { setStarted(true); setAnswers(saved.answers); setAttemptId(saved.id); setStartedAt(saved.startedAt); }
    else if (done) setCompleted(true);
  }, [testId]);

  const q = qs[idx];
  useEffect(() => { if (q) setBookmarked(getBookmarks().includes(q.id)); }, [q?.id]);

  if (!test) return <div className="mx-auto max-w-3xl px-6 py-16"><div className="pastel-peach rounded-[2rem] p-8"><h1 className="text-3xl font-black">Test not found</h1><button onClick={()=>router.push("/tests")} className="mt-6 rounded-full bg-[#69628a] px-5 py-2.5 font-bold text-white">Back to tests</button></div></div>;

  if (completed && !started) return <div className="mx-auto max-w-4xl px-6 py-16"><div className="soft-card rounded-[2.5rem] p-9 md:p-12"><p className="text-xs font-black uppercase tracking-[.18em] text-[#7c7698]">Completed test</p><h1 className="mt-4 text-4xl font-black tracking-[-.04em]">{test.title.replaceAll("_"," ")}</h1><p className="mt-3 text-[#737982]">You have already completed this test. Your result is saved.</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={()=>router.push(`/tests/${testId}/result`)} className="rounded-full bg-[#69628a] px-6 py-3 font-bold text-white">Review result →</button><button onClick={()=>{setCompleted(false);setStarted(true);setIdx(0);setAnswers({});const id=crypto.randomUUID();const now=new Date().toISOString();setAttemptId(id);setStartedAt(now);saveAttempt({id,testId,startedAt:now,updatedAt:now,answers:{}})}} className="rounded-full border border-[#dedbd4] bg-white px-6 py-3 font-bold">Retake test</button></div></div></div>;

  if (!started) return <div className="mx-auto max-w-5xl px-6 py-12 md:py-16"><div className="pastel-lavender rounded-[2.5rem] p-8 md:p-12"><p className="text-xs font-black uppercase tracking-[.18em] text-[#756f92]">{pillarMap[test.pillar]} · TEST {testId.replace("TEST_","")}</p><h1 className="mt-5 text-5xl font-black tracking-[-.045em]">{test.title.replaceAll("_"," ")}</h1><div className="mt-6 flex flex-wrap gap-2 text-sm font-bold text-[#6c7180]"><span className="rounded-full bg-white/70 px-4 py-2">{test.question_count} questions</span><span className="rounded-full bg-white/70 px-4 py-2">No countdown</span><span className="rounded-full bg-white/70 px-4 py-2">Your time is recorded</span></div>{qs.length!==test.question_count&&<p className="mt-5 rounded-2xl bg-white/70 p-4 text-sm font-semibold text-[#8b5c64]">Question bank incomplete: {qs.length} of {test.question_count} questions are currently available.</p>}<button disabled={!qs.length} onClick={()=>{const id=crypto.randomUUID();const now=new Date().toISOString();setAttemptId(id);setStartedAt(now);setStarted(true);setIdx(0);setAnswers({});saveAttempt({id,testId,startedAt:now,updatedAt:now,answers:{}})}} className="mt-9 rounded-full bg-[#69628a] px-7 py-3.5 font-bold text-white disabled:opacity-40">{qs.length?"Start test →":"No questions loaded"}</button></div></div>;

  if (!q) return null;
  const opts=(q.o||[]) as any[]; const answer=answers[q.id]||""; const label=q.subquestion?`Question ${q.number}${q.subquestion}`:`Question ${q.number}`; const progress=((idx+1)/qs.length)*100;
  const updateAnswer=(value:string)=>{const next={...answers,[q.id]:value};setAnswers(next);const old=getAttempt(testId);saveAttempt({id:attemptId,testId,startedAt:old?.startedAt||startedAt||new Date().toISOString(),updatedAt:new Date().toISOString(),answers:next});};
  const finish=async()=>{const wrong=qs.filter((x:any)=>answers[x.id]&&String(answers[x.id]).trim().toLowerCase()!==String(x.a??"").trim().toLowerCase()).map((x:any)=>x.id);setWrongQuestions([...new Set([...getWrongQuestions(),...wrong])]);const seconds=Math.max(0,Math.round((Date.now()-new Date(startedAt).getTime())/1000));completeAttempt(attemptId,answers,seconds);const {data}=await supabase?.auth.getSession() || {data:{session:null}};if(data.session?.user?.id)recordPracticeDay(data.session.user.id);router.push(`/tests/${testId}/result`);};

  return <div className="mx-auto max-w-5xl px-6 py-8 md:py-12"><div className="mb-5 flex items-center justify-between"><div><div className="text-sm font-black">{label} <span className="font-normal text-[#8a9098]">/ {qs.length}</span></div><div className="mt-1 text-xs text-[#8a9098]">{pillarMap[test.pillar]}</div></div><button onClick={()=>router.push("/tests")} className="rounded-full px-4 py-2 text-sm font-bold text-[#707984] hover:bg-white">Exit</button></div><div className="mb-7 h-2 overflow-hidden rounded-full bg-[#ebe9e5]"><div className="h-full rounded-full bg-[#8f89aa]" style={{width:`${progress}%`}}/></div><article className="soft-card rounded-[2.25rem] p-7 md:p-10"><div className="flex items-start justify-between gap-5"><div className="text-xl font-semibold leading-9 md:text-2xl">{q.t}</div><button onClick={()=>setBookmarked(toggleBookmark(q.id))} className="shrink-0 rounded-full border border-[#e5e2dc] bg-white px-3 py-2 text-xs font-bold text-[#6f6a8f]">{bookmarked?"★ Saved":"☆ Save"}</button></div>{opts.length?<div className="mt-9 grid gap-3">{opts.map((o:any,i:number)=>{const val=typeof o==="string"?o:o.text||o.label||o.option||"";return <button key={i} onClick={()=>updateAnswer(val)} className={`rounded-2xl border p-4 text-left transition ${answer===val?"border-[#9b94bd] bg-[#f0edf8]":"border-[#e5e2dc] bg-white hover:border-[#cfc9db]"}`}><span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f1eff4] text-xs font-black">{String.fromCharCode(65+i)}</span>{val||`Option ${String.fromCharCode(65+i)}`}</button>})}</div>:<input value={answer} onChange={e=>updateAnswer(e.target.value)} placeholder="Type your answer…" className="mt-9 w-full rounded-2xl border border-[#e3e0da] bg-white px-4 py-4 outline-none focus:border-[#9b94bd]"/>}</article><div className="mt-6 flex justify-between"><button disabled={!idx} onClick={()=>setIdx(idx-1)} className="rounded-full border border-[#ddd9d2] bg-white px-5 py-2.5 font-bold disabled:opacity-30">Previous</button>{idx<qs.length-1?<button onClick={()=>setIdx(idx+1)} className="rounded-full bg-[#69628a] px-6 py-2.5 font-bold text-white">Next →</button>:<button onClick={finish} className="rounded-full bg-[#69628a] px-6 py-2.5 font-bold text-white">Finish test</button>}</div></div>;
}
