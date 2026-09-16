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
  const isDeductiveTest1 = testId === "TEST_030";
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
    if (saved) { setStarted(true); setAnswers(saved.answers); setAttemptId(saved.id); setStartedAt(saved.startedAt); }
    else if (done) setCompleted(true);
  }, [testId]);
  const q = qs[idx];
  useEffect(() => { if (q) setBookmarked(getBookmarks().includes(q.id)); }, [q?.id]);
  const questionImageRefs = useMemo(() => {
    if (!q?.prompt?.blocks) return [] as string[];
    const refs: string[] = [];
    const walk = (blocks: any[]) => blocks.forEach((block) => { if (block?.type === "image" && block.assetRef) refs.push(block.assetRef); if (block?.type === "mixed" && Array.isArray(block.blocks)) walk(block.blocks); });
    walk(q.prompt.blocks as any[]); return [...new Set(refs)];
  }, [q?.id]);
  const currentReferenceMaterials = useMemo(() => referenceMaterialsForQuestion(testId, q?.number ?? idx + 1), [testId, q?.number, idx]);
  const visualMaterials = useMemo(() => {
    if (referenceMaterials.length) return referenceMaterials;
    if (currentReferenceMaterials.length) return currentReferenceMaterials;
    return questionImageRefs.map((assetRef, i) => ({ id: `${testId}-question-image-${i}`, assetRef, label: `Question ${q?.number ?? idx + 1}` }));
  }, [referenceMaterials, currentReferenceMaterials, questionImageRefs, testId, q?.number, idx]);
  const hasVisualPanel = visualMaterials.length > 0;

  if (!test) return <div className="app-page"><div className="pastel-peach rounded-[16px] p-8"><h1 className="section-title">Test not found</h1><button onClick={() => router.push("/tests")} className="yellow-button mt-6">Back to tests</button></div></div>;
  if (completed && !started) return <div className="app-page"><div className="quiz-card"><p className="eyebrow">Completed test</p><h1 className="section-title mt-3">{test.title.replaceAll("_", " ")}</h1><p className="mt-3 text-sm text-[#99968f]">You have already completed this test. Your result is saved.</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => router.push(`/tests/${testId}/result`)} className="yellow-button">Review result →</button><button onClick={() => { const id = crypto.randomUUID(); const now = new Date().toISOString(); setCompleted(false); setStarted(true); setIdx(0); setAnswers({}); setAttemptId(id); setStartedAt(now); saveAttempt({ id, testId, startedAt: now, updatedAt: now, answers: {} }); }} className="outline-action">Retake test</button></div></div></div>;
  if (!started) return <div className="app-page"><div className="quiz-card pastel-lavender"><p className="eyebrow">{pillarMap[test.pillar]} · TEST {testId.replace("TEST_", "")}</p><h1 className="mt-4 text-5xl font-medium tracking-[-.055em]">{test.title.replaceAll("_", " ")}</h1><div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-[#7d7972]"><span className="rounded-full bg-white px-4 py-2">{actualQuestionCount} questions</span><span className="rounded-full bg-white px-4 py-2">No countdown</span><span className="rounded-full bg-white px-4 py-2">Your time is recorded</span></div><button disabled={!actualQuestionCount} onClick={() => { const id = crypto.randomUUID(); const now = new Date().toISOString(); setAttemptId(id); setStartedAt(now); setStarted(true); setIdx(0); setAnswers({}); saveAttempt({ id, testId, startedAt: now, updatedAt: now, answers: {} }); }} className="yellow-button mt-8 disabled:opacity-40">{actualQuestionCount ? "Start test →" : "No questions loaded"}</button></div></div>;
  if (!q) return null;
  const answer = answers[q.id]; const label = q.subquestion ? `Question ${q.number}${q.subquestion}` : `Question ${q.number}`; const progress = ((idx + 1) / actualQuestionCount) * 100;
  const isAnswered = (value: unknown) => value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0);
  const updateAnswer = (value: unknown) => { const next = { ...answers, [q.id]: value }; setAnswers(next); const old = getAttempt(testId); saveAttempt({ id: attemptId, testId, startedAt: old?.startedAt || startedAt || new Date().toISOString(), updatedAt: new Date().toISOString(), answers: next }); };
  const finish = async () => { const wrong = qs.filter(x => answers[x.id] !== undefined && !answersMatch(x, answers[x.id])).map(x => x.id); setWrongQuestions([...new Set([...getWrongQuestions(), ...wrong])]); const seconds = Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)); completeAttempt(attemptId, answers, seconds); const session = await supabase?.auth.getSession(); const uid = session?.data.session?.user?.id; if (uid) recordPracticeDay(uid, new Date()); router.push(`/tests/${testId}/result`); };

  return <div className={`app-page quiz-page ${isDeductiveTest1 ? "deductive-test" : ""}`}>
    <div className="quiz-top"><div><div className="text-sm font-bold">{label} <span className="font-normal text-[#aaa7a0]">/ {actualQuestionCount}</span></div><div className="mt-1 text-xs text-[#aaa7a0]">{pillarMap[test.pillar]} · {test.title.replaceAll("_", " ")}</div></div><div className="flex items-center gap-2"><button onClick={() => router.push("/tests")} className="outline-action">Exit</button><button onClick={finish} className="yellow-button">Finish test</button></div></div>
    <div className="quiz-progress"><span style={{ width: `${progress}%` }} /></div>
    <div className="quiz-workspace">
      <section className="quiz-reference-pane deductive-passage-pane">
        {isDeductiveTest1 ? <div className="deductive-passage-panel"><div className="reference-toolbar"><div className="reference-heading"><span className="eyebrow">Passage</span><span className="reference-label">Information for Question {q.number}</span></div></div><div className="deductive-passage-scroll"><p className="deductive-passage">{q.context || "Read the information provided for this question."}</p></div>{hasVisualPanel && <div className="deductive-reference-wrap"><ReferenceViewer materials={visualMaterials} initialIndex={0} compact /></div>}</div> : hasVisualPanel ? <ReferenceViewer materials={visualMaterials} initialIndex={0} /> : <div className="quiz-reference-empty"><span className="eyebrow">Question material</span><p>No reference image is attached to this question.</p></div>}
      </section>
      <section className="quiz-question-pane deductive-answer-pane">
        <QuestionNavigator count={actualQuestionCount} current={idx} getStatus={(i) => i === idx ? "current" : isAnswered(answers[qs[i].id]) ? "answered" : "unanswered"} onSelect={setIdx} label="Questions" />
        <article className="quiz-card quiz-question-card" id={`question-${q.number}`}>
          <div className="quiz-question-head"><div><p className="eyebrow">{label}</p><div className="quiz-question mt-3"><QuestionPrompt blocks={q.prompt.blocks} hideImages={isDeductiveTest1 || hasVisualPanel} /></div></div><button onClick={() => setBookmarked(toggleBookmark(q.id))} className="outline-action shrink-0">{bookmarked ? "★ Saved" : "☆ Save"}</button></div>
          <div className="quiz-answer-label">Choose your answer</div>
          <QuestionResponse response={q.response} options={q.options} answer={q.answer} value={answer} onChange={updateAnswer} />
        </article>
        <div className="quiz-nav"><button disabled={!idx} onClick={() => setIdx(idx - 1)} className="outline-action disabled:opacity-30">← Previous</button>{idx < actualQuestionCount - 1 ? <button onClick={() => setIdx(idx + 1)} className="yellow-button">Next →</button> : <button onClick={finish} className="yellow-button">Finish test</button>}</div>
      </section>
    </div>
    {isDeductiveTest1 && <style jsx>{`\n      .deductive-test .quiz-reference-pane{grid-column:1;grid-row:1;min-height:0}\n      .deductive-test .quiz-question-pane{grid-column:2;grid-row:1;min-height:0}\n      .deductive-passage-panel{height:100%;min-height:0;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.78);overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(35,34,30,.025)}\n      .deductive-passage-scroll{min-height:0;overflow:auto;padding:24px 26px;flex:1}\n      .deductive-passage{white-space:pre-line;font-size:14px;line-height:1.8;color:#5f5d58;max-width:680px}\n      .deductive-reference-wrap{flex:0 0 42%;min-height:240px;border-top:1px solid var(--line)}\n      .deductive-reference-wrap :global(.reference-viewer){height:100%;min-height:0;border:0;border-radius:0;box-shadow:none}\n      .deductive-reference-wrap :global(.reference-stage){min-height:0}\n      @media(max-width:800px){.deductive-test .quiz-reference-pane,.deductive-test .quiz-question-pane{grid-column:auto;grid-row:auto}.deductive-reference-wrap{min-height:360px;flex-basis:48%}}\n    `}</style>}
  </div>;
}
