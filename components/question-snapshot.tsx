"use client";

import { useState } from "react";
import type { CanonicalQuestion, ContentBlock } from "../lib/canonical-engine";

type ReferenceMaterial = { id: string; assetRef: string; label: string };
type QuestionSnapshotProps = { question: CanonicalQuestion; materials?: ReferenceMaterial[] };

function wrapText(value: string, maxChars: number) {
  const lines: string[] = [];
  for (const paragraph of value.split(/\n+/)) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) { lines.push(""); continue; }
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars && line) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
  }
  return lines;
}

function blockText(blocks: ContentBlock[]): string {
  return blocks.flatMap((block): string[] => {
    if (block.type === "text") return [block.value];
    if (block.type === "mixed") return [blockText(block.blocks)];
    return [];
  }).join("\n").trim();
}

function assetSrc(assetRef: string) {
  return `/question-assets/${assetRef.includes(".") ? assetRef : `${assetRef}.webp`}`;
}

export default function QuestionSnapshot({ question, materials = [] }: QuestionSnapshotProps) {
  const [zoom, setZoom] = useState(100);
  const context = (question.context ?? "").replace(/^Use the .+ reference material shown for this question\.?$/i, "").trim();
  const prompt = blockText(question.prompt.blocks);
  const contextLines = wrapText(context, 82);
  const promptLines = wrapText(prompt, 82);
  const reference = materials[0];
  const imageBlocks = question.prompt.blocks.filter((block) => block.type === "image") as Extract<ContentBlock, { type: "image" }>[];
  const contextCount = Math.min(contextLines.length, 24);
  const referenceTop = 170 + contextCount * 22;
  const questionTop = reference ? referenceTop + 300 : 170 + contextCount * 22;
  const height = Math.max(430, questionTop + Math.min(promptLines.length, 18) * 24 + 80);

  return (
    <div className="question-snapshot-shell" aria-label={`Question ${question.number} snapshot`}>
      <div className="question-snapshot-toolbar">
        <span className="eyebrow">Question snapshot</span>
        <div className="question-snapshot-zoom">
          <button type="button" onClick={() => setZoom((v) => Math.max(60, v - 10))} disabled={zoom <= 60}>−</button>
          <button type="button" onClick={() => setZoom(100)} className="question-snapshot-zoom-value">{zoom}%</button>
          <button type="button" onClick={() => setZoom((v) => Math.min(180, v + 10))} disabled={zoom >= 180}>+</button>
        </div>
      </div>
      <div className="question-snapshot-scroll">
        <div className="question-snapshot-canvas" style={{ width: `${zoom}%` }}>
          <svg viewBox={`0 0 900 ${height}`} role="img" aria-label={`Question ${question.number}`} className="question-snapshot">
            <rect x="0" y="0" width="900" height={height} fill="#fffdf8" />
            <rect x="28" y="28" width="844" height={height - 56} fill="none" stroke="#d9d4ca" />
            <text x="58" y="70" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="700" fill="#252525">DEDUCTIVE REASONING</text>
            <text x="842" y="70" textAnchor="end" fontFamily="Arial, sans-serif" fontSize="13" fill="#77736b">Question {question.number}</text>
            <line x1="58" y1="88" x2="842" y2="88" stroke="#d9d4ca" />

            {context && <>
              <text x="58" y="125" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" fill="#666159">INFORMATION</text>
              {contextLines.slice(0, 24).map((line, i) => <text key={`context-${i}`} x="58" y={151 + i * 22} fontFamily="Arial, sans-serif" fontSize="15" fill="#33312e">{line}</text>)}
            </>}

            {reference && <>
              <text x="58" y={referenceTop} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" fill="#666159">REFERENCE MATERIAL</text>
              <image href={assetSrc(reference.assetRef)} x="58" y={referenceTop + 18} width="784" height="260" preserveAspectRatio="xMidYMid meet" />
            </>}

            {imageBlocks.map((block, i) => <image key={`prompt-image-${i}`} href={assetSrc(block.assetRef)} x="58" y={questionTop} width="784" height="220" preserveAspectRatio="xMidYMid meet" />)}

            <text x="58" y={questionTop} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" fill="#666159">QUESTION</text>
            {promptLines.slice(0, 18).map((line, i) => <text key={`prompt-${i}`} x="58" y={questionTop + 28 + i * 24} fontFamily="Arial, sans-serif" fontSize="18" fontWeight={i === 0 ? "600" : "400"} fill="#222">{line}</text>)}
          </svg>
        </div>
      </div>
      <style jsx>{`
        .question-snapshot-shell{height:100%;min-height:0;display:flex;flex-direction:column;border:1px solid var(--line);border-radius:16px;background:#fff}
        .question-snapshot-toolbar{height:52px;flex:0 0 52px;display:flex;align-items:center;justify-content:space-between;padding:0 14px 0 18px;border-bottom:1px solid var(--line);background:#fff}
        .question-snapshot-zoom{display:flex;align-items:center;border:1px solid var(--line);border-radius:999px;overflow:hidden;background:#fff}
        .question-snapshot-zoom button{width:34px;height:30px;border:0;background:transparent;color:#55524d;font-size:16px;cursor:pointer}
        .question-snapshot-zoom button:disabled{opacity:.35;cursor:default}
        .question-snapshot-zoom-value{width:52px!important;border-left:1px solid var(--line)!important;border-right:1px solid var(--line)!important;font-size:11px!important;font-weight:700!important}
        .question-snapshot-scroll{flex:1;min-height:0;overflow:auto;padding:24px;background:#f5f2ec}
        .question-snapshot-canvas{min-width:100%;margin:0 auto;transition:width .15s ease}
        .question-snapshot{display:block;width:100%;height:auto;box-shadow:0 8px 28px rgba(50,45,38,.10)}
      `}</style>
    </div>
  );
}
