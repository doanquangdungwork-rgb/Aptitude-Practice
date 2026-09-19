"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type QuestionSnapshotProps = {
  questionNumber: number;
  src: string;
  solutionSrc?: string;
  fallback?: ReactNode;
  showSolution?: boolean;
  initialView?: "question" | "solution";
};

export default function QuestionSnapshot({
  questionNumber,
  src,
  solutionSrc = "",
  fallback,
  showSolution = false,
  initialView = "question",
}: QuestionSnapshotProps) {
  const [zoom, setZoom] = useState(100);
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState<"question" | "solution">(initialView);

  const activeSrc = view === "solution" ? solutionSrc : src;

  if (failed || !activeSrc) {
    if (view === "solution" && src) {
      return (
        <QuestionSnapshot
          questionNumber={questionNumber}
          src={src}
          fallback={fallback}
          showSolution={false}
        />
      );
    }
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div className="question-snapshot-shell" aria-label={view === "solution" ? `Solution for question ${questionNumber}` : `Question ${questionNumber} source snapshot`}>
      <div className="question-snapshot-toolbar">
        <span className="eyebrow">{view === "solution" ? `Solution ${questionNumber}` : `Question ${questionNumber}`}</span>

        {showSolution && solutionSrc ? (
          <div className="question-snapshot-tabs" role="tablist" aria-label="Snapshot view">
            <button
              type="button"
              role="tab"
              aria-selected={view === "question"}
              className={view === "question" ? "active" : ""}
              onClick={() => { setView("question"); setZoom(100); setFailed(false); }}
            >
              Question
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "solution"}
              className={view === "solution" ? "active" : ""}
              onClick={() => { setView("solution"); setZoom(100); setFailed(false); }}
            >
              Solution
            </button>
          </div>
        ) : null}

        <div className="question-snapshot-zoom">
          <button type="button" onClick={() => setZoom((v) => Math.max(60, v - 10))} disabled={zoom <= 60} aria-label="Zoom out">−</button>
          <button type="button" onClick={() => setZoom(100)} className="question-snapshot-zoom-value" aria-label="Reset zoom">{zoom}%</button>
          <button type="button" onClick={() => setZoom((v) => Math.min(180, v + 10))} disabled={zoom >= 180} aria-label="Zoom in">+</button>
        </div>
      </div>

      <div className="question-snapshot-scroll">
        <div className="question-snapshot-stage" style={{ width: `${zoom}%` }}>
          <img
            src={activeSrc}
            alt={view === "solution" ? `Source Solution ${questionNumber}` : `Source Question ${questionNumber}`}
            className="question-snapshot-image"
            onError={() => setFailed(true)}
          />
        </div>
      </div>

      <style jsx>{`
        .question-snapshot-shell{height:100%;min-height:0;display:flex;flex-direction:column;border:1px solid var(--line);border-radius:16px;background:#fff;overflow:hidden}
        .question-snapshot-toolbar{min-height:52px;flex:0 0 auto;display:flex;align-items:center;justify-content:flex-start;gap:12px;padding:10px 14px 10px 18px;border-bottom:1px solid var(--line);background:#fff}
        .question-snapshot-toolbar>.eyebrow{margin-right:auto}
        .question-snapshot-tabs{display:flex;align-items:center;gap:4px;padding:3px;border:1px solid var(--line);border-radius:999px;background:#f7f6f1}
        .question-snapshot-tabs button{border:0;border-radius:999px;background:transparent;padding:6px 11px;font-size:10px;font-weight:700;color:#8c8981;white-space:nowrap}
        .question-snapshot-tabs button.active{background:#242522;color:#fff}
        .question-snapshot-zoom{display:flex;align-items:center;border:1px solid var(--line);border-radius:999px;overflow:hidden;background:#fff;flex:0 0 auto}
        .question-snapshot-zoom button{width:34px;height:30px;border:0;background:transparent;color:#55524d;font-size:16px;cursor:pointer}
        .question-snapshot-zoom button:disabled{opacity:.35;cursor:default}
        .question-snapshot-zoom-value{width:52px!important;border-left:1px solid var(--line)!important;border-right:1px solid var(--line)!important;font-size:11px!important;font-weight:700!important}
        .question-snapshot-scroll{flex:1;min-height:0;overflow:auto;padding:24px;background:#f5f2ec}
        .question-snapshot-stage{min-width:100%;margin:0 auto;transition:width .15s ease}
        .question-snapshot-image{display:block;width:100%;height:auto;box-shadow:0 8px 28px rgba(50,45,38,.10);background:#fff}
        @media(max-width:700px){
          .question-snapshot-toolbar{flex-wrap:wrap}
          .question-snapshot-toolbar>.eyebrow{width:100%}
          .question-snapshot-tabs{order:2}
          .question-snapshot-zoom{order:3;margin-left:auto}
        }
      `}</style>
    </div>
  );
}
