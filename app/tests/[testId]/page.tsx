"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { appCatalog, pillarMap } from "../../../lib/data";
import { questionsForEngine, referenceMaterialsForQuestion } from "../../../lib/question-source";
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
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [attemptId, setAttemptId] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const saved = getAttempt(testId);
    const done = getCompletedAttempt(testId);
    if (saved) { setStarted(true); setAnswers(saved.answers); setAttemptId(saved.id); setStartedAt(saved.startedAt); }
    else if (done) setCompleted(true);
  }, [testId]);

  const q = qs[idx];
  const testDurationSeconds = Math.max(0, actualQuestionCount * 60);
  const currentReferenceMaterials = useMemo(() => referenceMaterialsForQuestion(testId, q?.number ?? idx + 1), [testId, q?.number, idx]);
  const hasPassage = Boolean(q?.context && String(q.context).trim());
  const isAnswered = (value: unknown) => value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0);
  const answer = q ? answers[q.id] : undefined;
  const label = q ? (q.subquestion ? `Question ${q.number}${q.subquestion}` : `Question ${q.number}`) : "";
  const progress = actualQuestionCount ? ((idx + 1) / actualQuestionCount) * 100 : 0;

  useEffect(() => { if (q) setBookmarked(getBookmarks().includes(q.id)); }, [q?.id]);

  const updateAnswer = (value: unknown) => {
    if (!q) return;
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    const old = getAttempt(testId);
    saveAttempt({ id: attemptId, testId, startedAt: old?.startedAt || startedAt || new Date().toISOString(), updatedAt: new Date().toISOString(), answers: next });
  };

  const finish = async () => {
    if (!attemptId || !startedAt) return;
    const wrong = qs.filter(x => answers[x.id] !== undefined && !answersMatch(x, answers[x.id])).map(x => x.id);
    setWrongQuestions([...new Set([...getWrongQuestions(), ...wrong])]);
    const seconds = Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000));
    completeAttempt(attemptId, answers, Math.min(seconds, testDurationSeconds || seconds));
    const session = await supabase?.auth.getSession();
    const uid = session?.data.session?.user?.id;
    if (uid) recordPracticeDay(uid, new Date());
    router.push(`/tests/${testId}/result`);
  };

  useEffect(() => {
    if (!started || !startedAt || !testDurationSeconds) return;
    const tick = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
      const remaining = Math.max(0, testDurationSeconds - elapsed);
      setRemainingSeconds(remaining);
      if (remaining <= 0) void finish();
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [started, startedAt, testDurationSeconds]);

  const formatCountdown = (seconds: number) => {
    const safe = Math.max(0, seconds);
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;
    return hours > 0 ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (!test) return <div className="app-page"><div className="pastel-peach rounded-[16px] p-8"><h1 className="section-title">Test not found</h1><button onClick={() => router.push("/tests")} className="yellow-button mt-6">Back to tests</button></div></div>;
  if (completed && !started) return <div className="app-page"><div className="quiz-card"><p className="eyebrow">Completed test</p><h1 className="section-title mt-3">{test.title.replaceAll("_", " ")}</h1><p className="mt-3 text-sm text-[#99968f]">You have already completed this test. Your result is saved.</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => router.push(`/tests/${testId}/result`)} className="yellow-button">Review result →</button><button onClick={() => { const id = crypto.randomUUID(); const now = new Date().toISOString(); setCompleted(false); setStarted(true); setIdx(0); setAnswers({}); setAttemptId(id); setStartedAt(now); saveAttempt({ id, testId, startedAt: now, updatedAt: now, answers: {} }); }} className="outline-action">Retake test</button></div></div></div>;
  if (!started) return <div className="app-page"><div className="quiz-card pastel-lavender"><p className="eyebrow">{pillarMap[test.pillar]} · TEST {testId.replace("TEST_", "")}</p><h1 className="mt-4 text-5xl font-medium tracking-[-.055em]">{test.title.replaceAll("_", " ")}</h1><div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-[#7d7972]"><span className="rounded-full bg-white px-4 py-2">{actualQuestionCount} questions</span><span className="rounded-full bg-white px-4 py-2">{actualQuestionCount} minute{actualQuestionCount === 1 ? "" : "s"}</span></div><button disabled={!actualQuestionCount} onClick={() => { const id = crypto.randomUUID(); const now = new Date().toISOString(); setAttemptId(id); setStartedAt(now); setStarted(true); setIdx(0); setAnswers({}); setRemainingSeconds(testDurationSeconds); saveAttempt({ id, testId, startedAt: now, updatedAt: now, answers: {} }); }} className="yellow-button mt-8 disabled:opacity-40">{actualQuestionCount ? "Start test →" : "No questions loaded"}</button></div></div>;
  if (!q) return null;

  const hasReference = currentReferenceMaterials.length > 0;
  const questionImageBlocks = (q.prompt?.blocks ?? []).filter((block: any) => block?.type === "image");
  const questionTextBlocks = (q.prompt?.blocks ?? []).filter((block: any) => block?.type === "text");

  return <div className={`app-page quiz-page ${hasPassage ? "passage-test" : ""}`}>
    <div className="quiz-top"><div><div className="text-sm font-bold">{label} <span className="font-normal text-[#aaa7a0]">/ {actualQuestionCount}</span></div><div className="mt-1 text-xs text-[#aaa7a0]">{pillarMap[test.pillar]} · {test.title.replaceAll("_", " ")}</div></div><div className="flex items-center gap-2"><div className={`test-countdown ${remainingSeconds <= 60 ? "urgent" : ""}`} aria-label="Time remaining">{formatCountdown(remainingSeconds)}</div><button onClick={() => router.push("/tests")} className="outline-action">Exit</button><button onClick={finish} className="yellow-button">Finish test</button></div></div>
    <div className="quiz-progress"><span style={{ width: `${progress}%` }} /></div>
    <div className="quiz-workspace">
      <section className="quiz-reference-pane passage-material-pane">
        {hasReference ? <ReferenceViewer materials={currentReferenceMaterials} initialIndex={0} /> : hasPassage ? <ReferenceViewer materials={[]} text={q.context} textLabel={`Information for ${label}`} eyebrowLabel="Passage" /> : questionImageBlocks.length ? <div className="visual-choice-material"><span className="eyebrow">Question figure</span><QuestionPrompt blocks={questionImageBlocks as any} /></div> : <div className="quiz-reference-empty"><span className="eyebrow">Question material</span><p>No reference material is attached to this question.</p></div>}
      </section>
      <section className="quiz-question-pane answer-pane">
        <QuestionNavigator count={actualQuestionCount} current={idx} getStatus={(i) => i === idx ? "current" : isAnswered(answers[qs[i].id]) ? "answered" : "unanswered"} onSelect={setIdx} label="Questions" />
        <article className="quiz-card quiz-question-card" id={`question-${q.number}`}>
          <div className="quiz-question-head"><div className="flex-1"><p className="eyebrow">{label}</p><div className="quiz-question mt-3">{questionTextBlocks.length ? <QuestionPrompt blocks={questionTextBlocks as any} /> : <QuestionPrompt blocks={q.prompt.blocks} hideImages={hasReference || hasPassage} />}</div></div><button onClick={() => setBookmarked(toggleBookmark(q.id))} className="outline-action shrink-0">{bookmarked ? "★ Saved" : "☆ Save"}</button></div>
          <div className="quiz-answer-label">Choose your answer</div>
          <QuestionResponse response={q.response} options={q.options} answer={q.answer} value={answer} onChange={updateAnswer} />
        </article>
        <div className="quiz-nav"><button disabled={!idx} onClick={() => setIdx(idx - 1)} className="outline-action disabled:opacity-30">← Previous</button>{idx < actualQuestionCount - 1 ? <button onClick={() => setIdx(idx + 1)} className="yellow-button">Next →</button> : <button onClick={finish} className="yellow-button">Finish test</button>}</div>
      </section>
    </div>
    <style jsx>{`
      .passage-test .quiz-reference-pane{grid-column:1;grid-row:1;min-height:0}
      .passage-test .quiz-question-pane{grid-column:2;grid-row:1;min-height:0}
      .quiz-reference-pane{min-height:0}
      .quiz-question-pane{min-height:0}
      .quiz-question-card{border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:0 1px 0 rgba(0,0,0,.02)}
      .test-countdown{min-width:72px;padding:8px 11px;border:1px solid var(--line);border-radius:9px;background:#fff;font-size:13px;font-variant-numeric:tabular-nums;font-weight:800;letter-spacing:.02em;text-align:center;color:#4f4c47}
      .test-countdown.urgent{color:#b55a4d;border-color:#e6c4bd;background:#fff8f6}
      .visual-choice-material{height:100%;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:auto;padding:28px}
      .reference-text-content{max-width:720px;margin:0 auto;padding:34px 38px;color:#5f5d58;font-size:14px;line-height:1.8;white-space:pre-line;align-self:center;text-align:left}
      @media(max-width:800px){.passage-test .quiz-reference-pane,.passage-test .quiz-question-pane{grid-column:auto;grid-row:auto}.visual-choice-material{min-height:320px;padding:20px}.reference-text-content{padding:24px}}
    `}</style>
  </div>;
}
