"use client";

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

function blockText(blocks: ContentBlock[]) {
  return blocks.flatMap((block) => {
    if (block.type === "text") return [block.value];
    if (block.type === "mixed") return blockText(block.blocks);
    return [];
  }).join("\n").trim();
}

function assetSrc(assetRef: string) {
  return `/question-assets/${assetRef.includes(".") ? assetRef : `${assetRef}.webp`}`;
}

export default function QuestionSnapshot({ question, materials = [] }: QuestionSnapshotProps) {
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
      <div className="question-snapshot-scroll">
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
  );
}
