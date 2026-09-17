"use client";

import { useState } from "react";

type QuestionSnapshotProps = {
  questionNumber: number;
  src: string;
};

export default function QuestionSnapshot({ questionNumber, src }: QuestionSnapshotProps) {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="question-snapshot-shell" aria-label={`Question ${questionNumber} snapshot`}>
      <div className="question-snapshot-toolbar">
        <span className="eyebrow">Question {questionNumber}</span>
        <div className="question-snapshot-zoom">
          <button type="button" onClick={() => setZoom((v) => Math.max(60, v - 10))} disabled={zoom <= 60} aria-label="Zoom out">−</button>
          <button type="button" onClick={() => setZoom(100)} className="question-snapshot-zoom-value" aria-label="Reset zoom">{zoom}%</button>
          <button type="button" onClick={() => setZoom((v) => Math.min(180, v + 10))} disabled={zoom >= 180} aria-label="Zoom in">+</button>
        </div>
      </div>
      <div className="question-snapshot-scroll">
        <div className="question-snapshot-stage" style={{ width: `${zoom}%` }}>
          <img src={src} alt={`Deductive Reasoning Question ${questionNumber}`} className="question-snapshot-image" />
        </div>
      </div>
      <style jsx>{`
        .question-snapshot-shell{height:100%;min-height:0;display:flex;flex-direction:column;border:1px solid var(--line);border-radius:16px;background:#fff;overflow:hidden}
        .question-snapshot-toolbar{height:52px;flex:0 0 52px;display:flex;align-items:center;justify-content:space-between;padding:0 14px 0 18px;border-bottom:1px solid var(--line);background:#fff}
        .question-snapshot-zoom{display:flex;align-items:center;border:1px solid var(--line);border-radius:999px;overflow:hidden;background:#fff}
        .question-snapshot-zoom button{width:34px;height:30px;border:0;background:transparent;color:#55524d;font-size:16px;cursor:pointer}
        .question-snapshot-zoom button:disabled{opacity:.35;cursor:default}
        .question-snapshot-zoom-value{width:52px!important;border-left:1px solid var(--line)!important;border-right:1px solid var(--line)!important;font-size:11px!important;font-weight:700!important}
        .question-snapshot-scroll{flex:1;min-height:0;overflow:auto;padding:24px;background:#f5f2ec}
        .question-snapshot-stage{width:100%;max-width:none;margin:0 auto;transition:width .15s ease}
        .question-snapshot-image{display:block;width:100%;height:auto;box-shadow:0 8px 28px rgba(50,45,38,.10);background:#fff}
      `}</style>
    </div>
  );
}
