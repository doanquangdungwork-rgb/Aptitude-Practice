"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { appCatalog, pillarMap } from "../../../lib/data";
import { questionsForEngine, referenceMaterialsForTest, referenceMaterialsForQuestion } from "../../../lib/question-source";
import { answersMatch } from "../../../lib/canonical-engine";
import { completeAttempt, getAttempt, getBookmarks, getCompletedAttempt, getWrongQuestions, recordPracticeDay, saveAttempt, setWrongQuestions, toggleBookmark } from "../../../lib/progress";
import { supabase } from "../../../lib/supabase";
import { QuestionPrompt } from "../../../components/question-content";
import QuestionResponse from "../../../components/question-response";
import QuestionNavigator from "../../../components/question-navigator";
import ReferenceViewer from "../../../components/reference-viewer";

export default function TestPage() {
  const { testId } = useParams<{ testId: string }>();
  const router = useRouter();
  const test = appCatalog.tests.find((x: any) => x.test_id === testId);
  const qs = useMemo(() => questionsForEngine(testId), [testId]);
  const actualQuestionCount = qs.length;
  const referenceMaterials = useMemo(() => referenceMaterialsForTest(testId), [testId]);
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
      setStarted(true); setAnswers(saved.answers); setAttemptId(saved.id); setStartedAt(saved.startedAt);
    } else if (done) setCompleted(true);
  }, [testId]);

  const q = qs[idx];
  useEffect(() => { if (q) setBookmarked(getBookmarks().includes(q.id)); }, [q?.id]);

  const questionImageRefs = useMemo(() => {
    if (!q?.prompt?.blocks) return [] as string[];
    const refs: string[] = [];
    const walk = (blocks: any[]) => blocks.forEach((block) => {
      if (block?.type === "image" && block.assetRef) refs.push(block.assetRef);
      if (block?.type === "mixed" && Array.isArray(block.blocks)) walk(block.blocks);
    });
    walk(q.prompt.blocks as any[]);
    return [...new Set(refs)];
  }, [q?.id]);

  const visualMaterials = useMemo(() => {
    if (referenceMaterials.length) return referenceMaterials;
    return questionImageRefs.map((assetRef, i) => ({ id: `${testId}-question-image-${i}`, assetRef, label: `Question ${q?.number ?? idx + 1}` }));
  }, [referenceMaterials, questionImageRefs, testId, q?.number, idx]);
  const hasVisualPanel = visualMaterials.length > 0;

  if (!test) return <div className="app-page"><div className="pastel-peach rounded-[16px] p-8"><h1 className="section-title">Test not found</h1><button onClick={() => router.push("/tests")} className="yellow-button mt-6">Back to tests</button></div></div>;

  if (completed && !started) return <div className="app-page"><div className="quiz-card"><p className="eyebrow">Completed test</p><h1 className="section-title mt-3">{test.title.replaceAll("_", " ")}</h1><p className="mt-3 text-sm text-[#99968f]">You have already completed this test. Your result is saved.</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => router.push(`/tests/${testId}/result`)} className="yellow-button">Review result →</button><button onClick={() => { const id = crypto.randomUUID(); const now = new Date().toISOString(); setCompleted(false); setStarted(true); setIdx(0); setAnswers({}); setAttemptId(id); setStartedAt(now); saveAttempt({ id, testId, startedAt: now, updatedAt: now, answers: {} }); }} className="outline-action">Retake test</button></div></div></div>;

  if (!started) return <div className="app-page"><div className="quiz-card pastel-lavender"><p className="eyebrow">{pillarMap[test.pillar]} · TEST {testId.replace("TEST_", "")}</p><h1 className="mt-4 text-5xl font-medium tracking-[-.055em]">{test.title.replaceAll("_", " ")}</h1><div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-[#7d7972]"><span className="rounded-full bg-white px-4 py-2">{actualQuestionCount} questions</span><span className="rounded-full bg-white px-4 py-2">No countdown</span><span className="rounded-full bg-white px-4 py-2">Your time is recorded</span></div><button disabled={!actualQuestionCount} onClick={() => { const id = crypto.randomUUID(); const now = new Date().toISOString(); setAttemptId(id); setStartedAt(now); setStarted(true); setIdx(0); setAnswers({}); saveAttempt({ id, testId, startedAt: now, updatedAt: now, answers: {} }); }} className="yellow-button mt-8 disabled:opacity-40">{actualQuestionCount ? "Start test →" : "No questions loaded"}</button></div></div>;

  if (!q) return null;
  const answer = answers[q.id];
  const label = q.subquestion ? `Question ${q.number}${q.subquestion}` : `Question ${q.number}`;
  const progress = ((idx + 1) / actualQuestionCount) * 100;
  const isAnswered = (value: unknown) => value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0);
  const updateAnswer = (value: unknown) => {
    const next = { ...answers, [q.id]: value }; setAnswers(next);
    const old = getAttempt(testId);
    saveAttempt({ id: attemptId, testId, startedAt: old?.startedAt || startedAt || new Date().toISOString(), updatedAt: new Date().toISOString(), answers: next });
  };
  const finish = async () => {
    const wrong = qs.filter(x => answers[x.id] !== undefined && !answersMatch(x, answers[x.id])).map(x => x.id);
    setWrongQuestions([...new Set([...getWrongQuestions(), ...wrong])]);
    const seconds = Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000));
    completeAttempt(attemptId, answers, seconds);
    const session = await supabase?.auth.getSession(); const uid = session?.data.session?.user?.id;
    if (uid) recordPracticeDay(uid, new Date());
    router.push(`/tests/${testId}/result`);
  };

  const referenceIndex = referenceMaterials.length
    ? referenceMaterials.findIndex(m => m.id === referenceMaterialsForQuestion(testId, q.number)[0]?.id)
    : 0;

  return <div className="app-page quiz-page">
    <div className="quiz-top">
      <div><div className="text-sm font-bold">{label} <span className="font-normal text-[#aaa7a0]">/ {actualQuestionCount}</span></div><div className="mt-1 text-xs text-[#aaa7a0]">{pillarMap[test.pillar]} · {test.title.replaceAll("_", " ")}</div></div>
      <div className="flex items-center gap-2"><button onClick={() => router.push("/tests")} className="outline-action">Exit</button><button onClick={finish} className="yellow-button">Finish test</button></div>
    </div>
    <div className="quiz-progress"><span style={{ width: `${progress}%` }} /></div>

    <div className="quiz-workspace">
      <section className="quiz-question-pane">
        <QuestionNavigator count={actualQuestionCount} current={idx} getStatus={(i) => i === idx ? "current" : isAnswered(answers[qs[i].id]) ? "answered" : "unanswered"} onSelect={setIdx} label="Questions" />
        <article className="quiz-card quiz-question-card" id={`question-${q.number}`}>
          <div className="quiz-question-head"><div><p className="eyebrow">{label}</p><div className="quiz-question mt-3"><QuestionPrompt blocks={q.prompt.blocks} hideImages={hasVisualPanel} /></div></div><button onClick={() => setBookmarked(toggleBookmark(q.id))} className="outline-action shrink-0">{bookmarked ? "★ Saved" : "☆ Save"}</button></div>
          <div className="quiz-answer-label">Choose your answer</div>
          <QuestionResponse response={q.response} options={q.options} answer={q.answer} value={answer} onChange={updateAnswer} />
        </article>
        <div className="quiz-nav"><button disabled={!idx} onClick={() => setIdx(idx - 1)} className="outline-action disabled:opacity-30">← Previous</button>{idx < actualQuestionCount - 1 ? <button onClick={() => setIdx(idx + 1)} className="yellow-button">Next →</button> : <button onClick={finish} className="yellow-button">Finish test</button>}</div>
      </section>

      <section className="quiz-reference-pane">
        {hasVisualPanel ? <ReferenceViewer materials={visualMaterials} initialIndex={referenceIndex >= 0 ? referenceIndex : 0} /> : <div className="quiz-reference-empty"><span className="eyebrow">Question material</span><p>No reference image is attached to this question.</p></div>}
      </section>
    </div>
  </div>;
}
