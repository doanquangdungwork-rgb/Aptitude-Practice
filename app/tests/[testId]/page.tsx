"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { appCatalog, pillarMap } from "../../../lib/data";
import { questionsForEngine } from "../../../lib/question-source";
import { answersMatch } from "../../../lib/canonical-engine";
import { completeAttempt, getAttempt, getBookmarks, getCompletedAttempt, getWrongQuestions, recordPracticeDay, saveAttempt, setWrongQuestions, toggleBookmark } from "../../../lib/progress";
import { supabase } from "../../../lib/supabase";
import { QuestionPrompt } from "../../../components/question-content";
import QuestionResponse from "../../../components/question-response";

export default function TestPage() {
  const { testId } = useParams<{ testId: string }>();
  const router = useRouter();
  const test = appCatalog.tests.find((x: any) => x.test_id === testId);
  const qs = useMemo(() => questionsForEngine(testId), [testId]);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [attemptId, setAttemptId] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const saved = getAttempt(testId);
    const done = getCompletedAttempt(testId);
    if (saved) {
      setStarted(true);
      setAnswers(saved.answers);
      setAttemptId(saved.id);
      setStartedAt(saved.startedAt);
    } else if (done) {
      setCompleted(true);
    }
  }, [testId]);

  const q = qs[idx];
  useEffect(() => {
    if (q) setBookmarked(getBookmarks().includes(q.id));
  }, [q?.id]);

  if (!test) return <div className="app-page"><div className="pastel-peach rounded-[16px] p-8"><h1 className="section-title">Test not found</h1><button onClick={() => router.push("/tests")} className="yellow-button mt-6">Back to tests</button></div></div>;

  if (completed && !started) return <div className="app-page"><div className="quiz-card"><p className="eyebrow">Completed test</p><h1 className="section-title mt-3">{test.title.replaceAll("_", " ")}</h1><p className="mt-3 text-sm text-[#99968f]">You have already completed this test. Your result is saved.</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => router.push(`/tests/${testId}/result`)} className="yellow-button">Review result →</button><button onClick={() => { const id = crypto.randomUUID(); const now = new Date().toISOString(); setCompleted(false); setStarted(true); setIdx(0); setAnswers({}); setAttemptId(id); setStartedAt(now); saveAttempt({ id, testId, startedAt: now, updatedAt: now, answers: {} }); }} className="outline-action">Retake test</button></div></div></div>;

  if (!started) return <div className="app-page"><div className="quiz-card pastel-lavender"><p className="eyebrow">{pillarMap[test.pillar]} · TEST {testId.replace("TEST_", "")}</p><h1 className="mt-4 text-5xl font-medium tracking-[-.055em]">{test.title.replaceAll("_", " ")}</h1><div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-[#7d7972]"><span className="rounded-full bg-white px-4 py-2">{test.question_count} questions</span><span className="rounded-full bg-white px-4 py-2">No countdown</span><span className="rounded-full bg-white px-4 py-2">Your time is recorded</span></div>{qs.length !== test.question_count && <p className="mt-5 rounded-xl bg-[#fff2ea] p-4 text-sm text-[#7d6658]">Question bank incomplete: {qs.length} of {test.question_count} questions are currently available.</p>}<button disabled={!qs.length} onClick={() => { const id = crypto.randomUUID(); const now = new Date().toISOString(); setAttemptId(id); setStartedAt(now); setStarted(true); setIdx(0); setAnswers({}); saveAttempt({ id, testId, startedAt: now, updatedAt: now, answers: {} }); }} className="yellow-button mt-8 disabled:opacity-40">{qs.length ? "Start test →" : "No questions loaded"}</button></div></div>;

  if (!q) return null;

  const answer = answers[q.id];
  const label = q.subquestion ? `Question ${q.number}${q.subquestion}` : `Question ${q.number}`;
  const progress = ((idx + 1) / qs.length) * 100;
  const updateAnswer = (value: unknown) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    const old = getAttempt(testId);
    saveAttempt({ id: attemptId, testId, startedAt: old?.startedAt || startedAt || new Date().toISOString(), updatedAt: new Date().toISOString(), answers: next });
  };
  const finish = async () => {
    const wrong = qs.filter(x => answers[x.id] !== undefined && !answersMatch(x, answers[x.id])).map(x => x.id);
    setWrongQuestions([...new Set([...getWrongQuestions(), ...wrong])]);
    const seconds = Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000));
    completeAttempt(attemptId, answers, seconds);
    const session = await supabase?.auth.getSession();
    const uid = session?.data.session?.user?.id;
    if (uid) recordPracticeDay(uid, new Date());
    router.push(`/tests/${testId}/result`);
  };

  return <div className="app-page"><div className="quiz-shell"><div className="quiz-top"><div><div className="text-sm font-bold">{label} <span className="font-normal text-[#aaa7a0]">/ {qs.length}</span></div><div className="mt-1 text-xs text-[#aaa7a0]">{pillarMap[test.pillar]}</div></div><button onClick={() => router.push("/tests")} className="outline-action">Exit</button></div><div className="quiz-progress"><span style={{ width: `${progress}%` }} /></div><article className="quiz-card mt-6"><div className="flex items-start justify-between gap-5"><div className="quiz-question flex-1"><QuestionPrompt blocks={q.prompt.blocks} /></div><button onClick={() => setBookmarked(toggleBookmark(q.id))} className="outline-action shrink-0">{bookmarked ? "★ Saved" : "☆ Save"}</button></div><QuestionResponse response={q.response} options={q.options} answer={q.answer} value={answer} onChange={updateAnswer} /></article><div className="quiz-nav"><button disabled={!idx} onClick={() => setIdx(idx - 1)} className="outline-action disabled:opacity-30">Previous</button>{idx < qs.length - 1 ? <button onClick={() => setIdx(idx + 1)} className="yellow-button">Next →</button> : <button onClick={finish} className="yellow-button">Finish test</button>}</div></div></div>;
}
