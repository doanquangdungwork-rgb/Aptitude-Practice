"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { appCatalog, pillarMap } from "../../../../lib/data";
import { questionsForEngine } from "../../../../lib/question-source";
import { answersMatch, normalizeChoice } from "../../../../lib/canonical-engine";
import { getCompletedAttempt, getWrongQuestions, setWrongQuestions } from "../../../../lib/progress";
import ShareCard from "../../../../components/share-card";
import { QuestionPrompt } from "../../../../components/question-content";

const formatTime = (seconds = 0) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
const answerLabel = (value: unknown) => Array.isArray(value) ? value.join(", ") : value && typeof value === "object" ? Object.entries(value as Record<string, unknown>).map(([k, v]) => `${k}: ${v}`).join(" · ") : String(value ?? "");

export default function ResultPage() {
  const { testId } = useParams<{ testId: string }>();
  const test = appCatalog.tests.find((x: any) => x.test_id === testId);
  const qs = useMemo(() => questionsForEngine(testId), [testId]);
  const [attempt, setAttempt] = useState<any>(null);
  useEffect(() => setAttempt(getCompletedAttempt(testId)), [testId]);

  if (!test || !attempt) return <div className="app-page"><div className="quiz-card"><h1 className="section-title">Result unavailable</h1><p className="mt-2 text-sm text-[#99968f]">Complete the test first to see the review.</p><Link href={`/tests/${testId}`} className="yellow-button mt-6 inline-flex">Back to test</Link></div></div>;

  const answered = qs.filter(q => attempt.answers?.[q.id] !== undefined && attempt.answers?.[q.id] !== "");
  const correct = qs.filter(q => answersMatch(q, attempt.answers?.[q.id])).length;
  const wrong = answered.filter(q => !answersMatch(q, attempt.answers?.[q.id])).length;
  const unanswered = qs.length - answered.length;
  const accuracy = qs.length ? Math.round(correct / qs.length * 100) : 0;
  const markWrong = (id: string) => { const ids = getWrongQuestions(); setWrongQuestions(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]); };

  return <div className="app-page"><div className="section-head"><div><p className="eyebrow">Test review</p><h1 className="section-title mt-2">{test.title.replaceAll("_", " ")}</h1><p className="mt-2 text-sm text-[#99968f]">{pillarMap[test.pillar]} · completed {new Date(attempt.completedAt).toLocaleString()}</p></div><div className="flex flex-wrap gap-3"><ShareCard kind="result" result={{ title: test.title.replaceAll("_", " "), correct, total: qs.length, accuracy, duration: formatTime(attempt.durationSeconds || 0) }} /><Link href="/tests" className="outline-action">All tests</Link></div></div>
    <section className="result-hero"><div><p className="eyebrow">Your result</p><div className="score-number mt-3">{correct}<span className="ml-2 text-3xl text-[#aaa7a0]">/ {qs.length}</span></div><p className="mt-3 text-sm text-[#77736b]">{accuracy}% accuracy · {formatTime(attempt.durationSeconds || 0)} spent</p></div><div className="result-metrics"><div className="result-metric"><b>{correct}</b><span>Correct</span></div><div className="result-metric"><b>{wrong}</b><span>Wrong</span></div><div className="result-metric"><b>{unanswered}</b><span>Skipped</span></div></div></section>
    <div className="mt-5 quiz-progress"><span style={{ width: `${accuracy}%` }} /></div><div className="section-head mt-12"><div><p className="eyebrow">Question by question</p><h2 className="section-title mt-2">Review your answers.</h2></div><span className="text-xs text-[#aaa7a0]">Scroll to revisit everything</span></div>
    <section className="space-y-4">{qs.map(q => { const selected = attempt.answers?.[q.id]; const skipped = selected === undefined || selected === "" || (Array.isArray(selected) && selected.length === 0); const isCorrect = !skipped && answersMatch(q, selected); const correctValue = q.answer.type === "single" || q.answer.type === "text" || q.answer.type === "numeric" ? q.answer.value : q.answer.type === "multiple" ? q.answer.values : q.answer.parts; return <article key={q.id} className={`review-item ${skipped ? "skipped" : isCorrect ? "correct" : "wrong"}`}><div className="flex items-start justify-between gap-4"><span className="eyebrow">Question {q.number}{q.subquestion || ""}</span><span className="text-xs font-bold">{skipped ? "Skipped" : isCorrect ? "Correct" : "Incorrect"}</span></div><div className="mt-4 text-lg font-medium leading-8"><QuestionPrompt blocks={q.prompt.blocks} /></div>{q.options.length > 0 && <div className="mt-5 grid gap-2">{q.options.map((o, j) => { const selectedHere = Array.isArray(selected) ? selected.includes(o.id) : String(selected ?? "") === o.id; const correctHere = q.answer.type === "single" ? normalizeChoice(o.id) === normalizeChoice(q.answer.value) : q.answer.type === "multiple" && q.answer.values.some(v => normalizeChoice(v) === normalizeChoice(o.id)); return <div key={o.id} className={`review-option ${correctHere ? "correct-answer" : selectedHere ? "selected-wrong" : ""}`}><span className="mr-2 font-bold">{String.fromCharCode(65 + j)}.</span><QuestionPrompt blocks={[o.content]}/>{correctHere && <span className="ml-2 text-xs">✓ Correct answer</span>}{selectedHere && !correctHere && <span className="ml-2 text-xs">Your answer</span>}</div>; })}</div>}{skipped && <div className="mt-5 rounded-xl border border-[#e7e5de] bg-[#fbfaf6] p-4 text-sm"><b>Correct answer:</b> {answerLabel(correctValue)}</div>}{!skipped && !isCorrect && <div className="mt-5 rounded-xl bg-[#fff8d8] p-4 text-sm"><b>Your answer:</b> {answerLabel(selected)}<br /><b>Correct answer:</b> {answerLabel(correctValue)}</div>}{q.explanation && <div className="mt-5 border-t border-current/10 pt-4 text-sm leading-6 text-[#6f6b64]"><b>Explanation</b><div className="mt-1">{q.explanation.blocks.map((b, i) => b.type === "text" ? <span key={i} className="whitespace-pre-wrap">{b.value}</span> : null)}</div></div>}{!skipped && !isCorrect && <button onClick={() => markWrong(q.id)} className="mt-4 outline-action">Add/remove from wrong questions</button>}</article>; })}</section>
  </div>;
}
