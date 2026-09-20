"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { questionSnapshotSrc } from "../lib/question-snapshot";
import { answersMatch } from "../lib/canonical-engine";
import { completeAttempt, getAttempt, getBookmarks, getWrongQuestions, recordPracticeDay, saveAttempt, setWrongQuestions, toggleBookmark } from "../lib/progress";
import { supabase } from "../lib/supabase";
import { QuestionPrompt } from "./question-content";
import QuestionResponse from "./question-response";
import QuestionNavigator from "./question-navigator";
import ReferenceViewer from "./reference-viewer";
import QuestionSnapshot from "./question-snapshot";

type ReferenceMaterial = { id: string; assetRef: string; label: string };
const CAPP_UNIQUE_CHARTS: ReferenceMaterial[] = [
  { id: "CAPP_CHART_1", assetRef: "ASSET_0001", label: "Annual salary" },
  { id: "CAPP_CHART_2", assetRef: "ASSET_0004", label: "Average property prices" },
  { id: "CAPP_CHART_3", assetRef: "ASSET_0007", label: "Coffee prices" },
  { id: "CAPP_CHART_4", assetRef: "ASSET_0010", label: "South American economies" },
];
function cappChartForQuestion(questionNumber: number): ReferenceMaterial { if (questionNumber <= 3) return CAPP_UNIQUE_CHARTS[0]; if (questionNumber <= 6) return CAPP_UNIQUE_CHARTS[1]; if (questionNumber <= 9) return CAPP_UNIQUE_CHARTS[2]; return CAPP_UNIQUE_CHARTS[3]; }
const DEDUCTIVE_REFERENCES: Record<string, ReferenceMaterial[]> = {
  TEST_030: [{ id: "DED1_BROADBAND", assetRef: "TEST_030_BROADBAND.svg", label: "Broadband plans" }, { id: "DED1_CONTRACTS", assetRef: "TEST_030_CONTRACTS.svg", label: "Salaries & contracts" }],
  TEST_031: [{ id: "DED2_CANALS", assetRef: "TEST_031_CANALS_v2.svg", label: "Canals and Rivertrips" }, { id: "DED2_JULIA", assetRef: "TEST_031_JULIA_v2.svg", label: "Julia’s Requirements" }],
  TEST_032: [{ id: "DED3_FLIGHTS", assetRef: "TEST_032_FLIGHTS_v2.svg", label: "Flights" }, { id: "DED3_TAX", assetRef: "TEST_032_TAX_v2.svg", label: "Council Tax Bands" }],
  TEST_033: [{ id: "DED4_LIBRARY", assetRef: "TEST_033_LIBRARY_v2.svg", label: "Alphabetic Library" }, { id: "DED4_FURNITURE", assetRef: "TEST_033_SHOPS_v2.svg", label: "Shops" }],
};
function referenceMaterialsForQuestion(testId: string, questionNumber: number): ReferenceMaterial[] {
  if (testId === "TEST_001" && questionNumber >= 1 && questionNumber <= 12) return [cappChartForQuestion(questionNumber)];
  if (testId === "TEST_002" && questionNumber <= 16) return [{ id: "DATA_P2", assetRef: "TEST_002_DATA_P2", label: "Data Set 1" }];
  if (testId === "TEST_002" && questionNumber <= 32) return [{ id: "DATA_P3", assetRef: "TEST_002_DATA_P3", label: "Data Set 2" }];
  if (testId === "TEST_002") return [{ id: "DATA_P4", assetRef: "TEST_002_DATA_P4", label: "Data Set 3" }];
  if (testId === "TEST_030" && (questionNumber === 5 || questionNumber === 6)) return [DEDUCTIVE_REFERENCES.TEST_030[0]];
  if (testId === "TEST_030" && (questionNumber === 17 || questionNumber === 18)) return [DEDUCTIVE_REFERENCES.TEST_030[1]];
  if (testId === "TEST_031" && (questionNumber === 5 || questionNumber === 6)) return [DEDUCTIVE_REFERENCES.TEST_031[0]];
  if (testId === "TEST_031" && (questionNumber === 17 || questionNumber === 18)) return [DEDUCTIVE_REFERENCES.TEST_031[1]];
  if (testId === "TEST_032" && (questionNumber === 5 || questionNumber === 6)) return [DEDUCTIVE_REFERENCES.TEST_032[0]];
  if (testId === "TEST_032" && (questionNumber === 17 || questionNumber === 18)) return [DEDUCTIVE_REFERENCES.TEST_032[1]];
  if (testId === "TEST_033" && (questionNumber === 5 || questionNumber === 6)) return [DEDUCTIVE_REFERENCES.TEST_033[0]];
  if (testId === "TEST_033" && (questionNumber === 17 || questionNumber === 18)) return [DEDUCTIVE_REFERENCES.TEST_033[1]];
  return [];
}

export default function TestPageClient({ testId, test, qs, pillarMap }: { testId: string; test: any; qs: any[]; pillarMap: Record<string, string> }) {
  const router = useRouter();
  const actualQuestionCount = qs.length;
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [attemptId, setAttemptId] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  useEffect(() => {
    const saved = getAttempt(testId);
    if (saved) {
      setStarted(true); setAnswers(saved.answers); setAttemptId(saved.id); setStartedAt(saved.startedAt);
    } else if (actualQuestionCount > 0) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      setAttemptId(id); setStartedAt(now); setStarted(true); setIdx(0); setAnswers({}); setRemainingSeconds(actualQuestionCount * 60);
      saveAttempt({ id, testId, startedAt: now, updatedAt: now, answers: {} });
    }
  }, [testId, actualQuestionCount]);

  const q = qs[idx];
  const testDurationSeconds = Math.max(0, actualQuestionCount * 60);
  const currentReferenceMaterials = useMemo(() => referenceMaterialsForQuestion(testId, q?.number ?? idx + 1), [testId, q?.number, idx]);
  const hasPassage = Boolean(q?.context && String(q.context).trim());
  const isAnswered = (question: any, value: unknown) => {
    if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return false;
    if (question?.response?.type === "multiple_choice" && question.response.minSelections) return Array.isArray(value) && value.length >= question.response.minSelections;
    return true;
  };
  const answer = q ? answers[q.id] : undefined;
  const label = q ? (q.subquestion ? `Question ${q.number}${q.subquestion}` : `Question ${q.number}`) : "";
  const progress = actualQuestionCount ? ((idx + 1) / actualQuestionCount) * 100 : 0;
  const snapshotSrc = q ? questionSnapshotSrc(testId, q.source?.sourceFile, q.number) : "";
  const isSnapshotTest = Boolean(snapshotSrc);

  useEffect(() => { if (q) setBookmarked(getBookmarks().includes(q.id)); }, [q?.id]);

  const updateAnswer = (value: unknown) => {
    if (!q) return;
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    const old = getAttempt(testId);
    saveAttempt({ id: attemptId, testId, startedAt: old?.startedAt || startedAt || new Date().toISOString(), updatedAt: new Date().toISOString(), answers: next });
  };

  const returnToPractice = () => {
    router.push("/practice");
  };

  const submitFinish = async () => {
    if (!attemptId || !startedAt) return;
    const wrong = qs.filter(x => answers[x.id] !== undefined && !answersMatch(x, answers[x.id])).map(x => x.id);
    setWrongQuestions([...new Set([...getWrongQuestions(), ...wrong])]);
    const seconds = Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000));
    completeAttempt(attemptId, answers, Math.min(seconds, testDurationSeconds || seconds));
    const session = await supabase?.auth.getSession();
    const uid = session?.data.session?.user?.id;
    if (uid) recordPracticeDay(uid, new Date());
    router.replace(`/tests/${testId}/result`);
  };

  useEffect(() => {
    if (!started || !startedAt || !testDurationSeconds) return;
    const tick = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
      const remaining = Math.max(0, testDurationSeconds - elapsed);
      setRemainingSeconds(remaining);
      if (remaining <= 0) void submitFinish();
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [started, startedAt, testDurationSeconds]);
  const answeredCount = qs.reduce((count, question) => count + (isAnswered(question, answers[question.id]) ? 1 : 0), 0);
  const unansweredCount = Math.max(0, actualQuestionCount - answeredCount);
  const openFinishConfirmation = () => setShowFinishConfirm(true);

  const formatCountdown = (seconds: number) => {
    const safe = Math.max(0, seconds);
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;
    return hours > 0 ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (!test) return <div className="app-page"><div className="pastel-peach rounded-[16px] p-8"><h1 className="section-title">Test not found</h1><button onClick={() => router.push("/tests")} className="yellow-button mt-6">Back to tests</button></div></div>;
  if (!started) return <div className="app-page"><div className="quiz-card"><p className="eyebrow">Loading test</p><h1 className="section-title mt-3">{test.title.replaceAll("_", " ")}</h1></div></div>;
  if (!q) return null;

  const questionImageBlocks = (q.prompt?.blocks ?? []).filter((block: any) => block?.type === "image");
  const referenceFallback = currentReferenceMaterials.length ? <ReferenceViewer materials={currentReferenceMaterials} initialIndex={0} /> : hasPassage ? <ReferenceViewer materials={[]} text={q.context} textLabel={`Information for ${label}`} eyebrowLabel="Passage" /> : questionImageBlocks.length ? <div className="visual-choice-material"><span className="eyebrow">Question figure</span><QuestionPrompt blocks={questionImageBlocks as any} /></div> : <div className="quiz-reference-empty"><span className="eyebrow">Question material</span><p>No reference material is attached to this question.</p></div>;

  return <div className={`app-page quiz-page ${hasPassage ? "passage-test" : ""}`}>
    <div className="quiz-top"><div><div className="text-sm font-bold">{label} <span className="font-normal text-[#aaa7a0]">/ {actualQuestionCount}</span></div><div className="mt-1 text-xs text-[#aaa7a0]">{pillarMap[test.pillar]} · {test.title.replaceAll("_", " ")}</div></div><div className="flex items-center gap-2"><div className={`test-countdown ${remainingSeconds <= 60 ? "urgent" : ""}`} aria-label="Time remaining">{formatCountdown(remainingSeconds)}</div><button onClick={returnToPractice} className="outline-action">Exit</button><button onClick={openFinishConfirmation} className="yellow-button">Finish test</button></div></div>
    <div className="quiz-progress"><span style={{ width: `${progress}%` }} /></div>
    <div className="quiz-workspace">
      <section className={`quiz-reference-pane ${isSnapshotTest ? "deductive-snapshot-pane" : "passage-material-pane"}`}>
        {isSnapshotTest ? <QuestionSnapshot questionNumber={q.number} src={snapshotSrc} fallback={referenceFallback} /> : referenceFallback}
      </section>
      <section className="quiz-question-pane answer-pane">
        <QuestionNavigator count={actualQuestionCount} current={idx} getStatus={(i) => i === idx ? "current" : isAnswered(qs[i], answers[qs[i].id]) ? "answered" : "unanswered"} onSelect={setIdx} label="Questions" />
        <article className="quiz-card quiz-question-card" id={`question-${q.number}`}>
          <div className="quiz-question-head"><div className="flex-1"><p className="eyebrow">{isSnapshotTest ? "Answer" : label}</p>{!isSnapshotTest && <div className="quiz-question mt-3"><QuestionPrompt blocks={q.prompt.blocks} hideImages={Boolean(currentReferenceMaterials.length || hasPassage)} /></div>}</div><button onClick={() => setBookmarked(toggleBookmark(q.id))} className="outline-action shrink-0">{bookmarked ? "★ Saved" : "☆ Save"}</button></div>
          <div className="quiz-answer-label">Choose your answer</div>
          <QuestionResponse response={q.response} options={q.options} answer={q.answer} value={answer} onChange={updateAnswer} screenshotMode={isSnapshotTest} />
        </article>
        <div className="quiz-nav"><button disabled={!idx} onClick={() => setIdx(idx - 1)} className="outline-action disabled:opacity-30">← Previous</button>{idx < actualQuestionCount - 1 ? <button onClick={() => setIdx(idx + 1)} className="yellow-button">Next →</button> : <button onClick={openFinishConfirmation} className="yellow-button">Finish test</button>}</div>
      </section>
    </div>
    {showFinishConfirm && <div className="finish-confirm-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowFinishConfirm(false); }}>
      <div className="finish-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="finish-confirm-title">
        <button type="button" className="finish-confirm-close" onClick={() => setShowFinishConfirm(false)} aria-label="Close">×</button>
        <div className="finish-confirm-art" aria-hidden="true"><span></span><i></i></div>
        <h2 id="finish-confirm-title">Finish test?</h2>
        <p className="finish-confirm-summary">You still have <strong>{formatCountdown(remainingSeconds)}</strong> remaining and <strong>{unansweredCount} unanswered question{unansweredCount === 1 ? "" : "s"}</strong>.</p>
        <p className="finish-confirm-copy">If you finish now, your test will be submitted with the questions left unanswered.</p>
        <div className="finish-confirm-actions">
          <button type="button" className="outline-action finish-keep-going" onClick={() => setShowFinishConfirm(false)}>Keep going</button>
          <button type="button" className="yellow-button" onClick={() => { setShowFinishConfirm(false); void submitFinish(); }}>Finish test</button>
        </div>
      </div>
    </div>}

    <style jsx>{`
      .finish-confirm-overlay{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:24px;background:rgba(20,20,18,.68)}
      .finish-confirm-modal{position:relative;width:min(490px,calc(100vw - 32px));padding:30px 34px 28px;border:1px solid #dedbd3;border-radius:18px;background:#fffefa;box-shadow:0 24px 80px rgba(20,20,18,.24);text-align:center}
      .finish-confirm-close{position:absolute;right:17px;top:13px;border:0;background:transparent;color:#5e5b55;font-size:24px;line-height:1;padding:2px 5px;cursor:pointer}
      .finish-confirm-art{position:relative;width:72px;height:58px;margin:0 auto 18px}
      .finish-confirm-art span,.finish-confirm-art i{position:absolute;top:7px;width:54px;height:54px;border:1px solid #d7d4cc;border-radius:50%}
      .finish-confirm-art span{left:5px;background:#f3f1ea}.finish-confirm-art i{left:23px;background:#f7efa8;opacity:.9}
      .finish-confirm-modal h2{margin:0;font-size:30px;line-height:1.05;letter-spacing:-.045em;font-weight:600;color:#242421}
      .finish-confirm-summary{max-width:390px;margin:18px auto 0;font-size:13px;line-height:1.65;color:#69665f}.finish-confirm-summary strong{color:#33322e;font-weight:700}
      .finish-confirm-copy{max-width:385px;margin:13px auto 0;font-size:12px;line-height:1.65;color:#77736b}
      .finish-confirm-actions{display:flex;justify-content:center;gap:12px;margin-top:24px}.finish-confirm-actions button{min-width:145px}.finish-keep-going{background:#fff}
      @media(max-width:560px){.finish-confirm-modal{padding:27px 22px 23px}.finish-confirm-actions{flex-direction:column-reverse}.finish-confirm-actions button{width:100%}}
      .passage-test .quiz-reference-pane{grid-column:1;grid-row:1;min-height:0}.passage-test .quiz-question-pane{grid-column:2;grid-row:1;min-height:0}.quiz-reference-pane{min-height:0}.quiz-question-pane{min-height:0}.deductive-snapshot-pane{grid-column:1;grid-row:1;min-height:0}.deductive-snapshot-pane .question-snapshot-shell{height:100%;min-height:0}.quiz-question-card{border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:0 1px 0 rgba(0,0,0,.02)}.test-countdown{min-width:72px;padding:8px 11px;border:1px solid var(--line);border-radius:9px;background:#fff;font-size:13px;font-variant-numeric:tabular-nums;font-weight:800;letter-spacing:.02em;text-align:center;color:#4f4c47}.test-countdown.urgent{color:#b55a4d;border-color:#e6c4bd;background:#fff8f6}.visual-choice-material{height:100%;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:auto;padding:28px}@media(max-width:800px){.passage-test .quiz-reference-pane,.passage-test .quiz-question-pane{grid-column:auto;grid-row:auto}.visual-choice-material{min-height:320px;padding:20px}}
    `}</style>
  </div>;
}
