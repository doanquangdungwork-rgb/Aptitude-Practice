"use client";

import type { ContentBlock, CanonicalOption } from "../lib/canonical-engine";

function Block({ block, hideImages = false }: { block: ContentBlock; hideImages?: boolean }) {
  if (block.type === "text") {
    return <p className="whitespace-pre-wrap leading-7">{block.value}</p>;
  }
  if (block.type === "spacer") {
    return <div aria-hidden className={block.size === "lg" ? "h-8" : block.size === "sm" ? "h-2" : "h-4"} />;
  }
  if (block.type === "image") {
    if (hideImages) return null;
    return (
      <figure className="overflow-hidden rounded-2xl border border-[#e7e5de] bg-white">
        <img src={`/question-assets/${block.assetRef}.webp`} alt={block.alt || "Question figure"} className="block h-auto max-h-[680px] w-full object-contain" />
      </figure>
    );
  }
  return <div className="space-y-3">{block.blocks.map((child, i) => <Block key={i} block={child} hideImages={hideImages} />)}</div>;
}

export function QuestionPrompt({ blocks, hideImages = false }: { blocks: ContentBlock[]; hideImages?: boolean }) {
  return <div className="space-y-5">{blocks.map((block, i) => <Block key={i} block={block} hideImages={hideImages} />)}</div>;
}

export function CanonicalOptions({ options, selected, onSelect }: {
  options: CanonicalOption[];
  selected?: string | string[];
  onSelect: (id: string) => void;
}) {
  const selectedIds = new Set(Array.isArray(selected) ? selected : selected ? [selected] : []);
  return (
    <div className="mt-8 grid gap-3">
      {options.map((option, index) => {
        const active = selectedIds.has(option.id);
        return (
          <button key={option.id} type="button" onClick={() => onSelect(option.id)} className={`quiz-option text-left ${active ? "selected" : ""}`}>
            <span className="mr-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2f1eb] text-xs font-bold">
              {option.id.length <= 2 ? option.id.toUpperCase() : String.fromCharCode(65 + index)}
            </span>
            <span className="min-w-0 flex-1"><Block block={option.content} /></span>
          </button>
        );
      })}
    </div>
  );
}
