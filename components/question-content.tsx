"use client";

import type { ContentBlock, CanonicalOption } from "../lib/canonical-engine";

const DEDUCTIVE_TEST1_STEMS = [
  "Two FruitBars cost", "A BarBox will cost", "Barboxes have sold", "Fruitbars always sell", "Charles has two children", "An office holds 5 employees", "Frederick disagreed with Roger", "Simone wrote the seventh", "Simone wrote the same number", "Simone and Frederick both", "Taking each line in the argument to be true", "Using 5m2 of Wood", "A house requiring 10m2", "Spending £450 on Wood", "If Brick costs £100", "At the end of the contract, Lucy", "Debra has a Foxtrot contract", "Objects exist without projection", "Things-in-themselves are projected", "The mirror only exists", "The Self projects onto the mirror",
];
function isDeductiveStem(value: string) { return DEDUCTIVE_TEST1_STEMS.some(stem => value.trim().startsWith(stem)); }

function Block({ block, hideImages = false }: { block: ContentBlock; hideImages?: boolean }) {
  if (block.type === "text") return <p className="whitespace-pre-wrap leading-7">{block.value}</p>;
  if (block.type === "spacer") return <div aria-hidden className={block.size === "lg" ? "h-8" : block.size === "sm" ? "h-2" : "h-4"} />;
  if (block.type === "image") {
    if (hideImages) return null;
    if (block.crop) {
      const scale = block.crop.width <= 50 ? 2 : 2.15;
      const cropWidth = block.crop.width * scale;
      const cropHeight = block.crop.height * scale;
      const isOptionCrop = block.crop.width <= 50;
      return <figure className={`visual-crop relative shrink-0 overflow-hidden bg-transparent ${isOptionCrop ? "visual-option-crop" : "visual-question-crop"}`} style={{ width: cropWidth, height: cropHeight }}><img src={`/question-assets/${block.assetRef}.webp`} alt={block.alt || "Question figure"} className="absolute left-0 top-0 max-w-none" style={{ width: "auto", height: "auto", transformOrigin: "top left", transform: `translate(${-block.crop.x * scale}px, ${-block.crop.y * scale}px) scale(${scale})` }} /></figure>;
    }
    const src = block.assetRef.startsWith("/") || block.assetRef.startsWith("http") ? block.assetRef : `/question-assets/${block.assetRef}.webp`;
    return <figure className="overflow-hidden rounded-2xl border border-[#e7e5de] bg-white"><img src={src} alt={block.alt || "Question figure"} className="block h-auto max-h-[680px] w-full object-contain" /></figure>;
  }
  return <div className="space-y-3">{block.blocks.map((child, i) => <Block key={i} block={child} hideImages={hideImages} />)}</div>;
}

export function QuestionPrompt({ blocks, hideImages = false }: { blocks: ContentBlock[]; hideImages?: boolean }) {
  if (typeof window !== "undefined" && window.location.pathname.includes("/tests/TEST_030")) {
    const text = blocks.filter((block): block is Extract<ContentBlock, { type: "text" }> => block.type === "text").map(block => block.value).join(" ");
    if (isDeductiveStem(text)) return null;
  }
  return <div className="space-y-5">{blocks.map((block, i) => <Block key={i} block={block} hideImages={hideImages} />)}</div>;
}

export function CanonicalOptions({ options, selected, onSelect }: { options: CanonicalOption[]; selected?: string | string[]; onSelect: (id: string) => void }) {
  const selectedIds = new Set(Array.isArray(selected) ? selected : selected ? [selected] : []);
  return <div className="mt-8 grid gap-3">{options.map((option, index) => { const active = selectedIds.has(option.id); return <button key={option.id} type="button" onClick={() => onSelect(option.id)} className={`quiz-option text-left ${active ? "selected" : ""}`}><span className="mr-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2f1eb] text-xs font-bold">{option.id.length <= 2 ? option.id.toUpperCase() : String.fromCharCode(65 + index)}</span><span className="min-w-0 flex-1"><Block block={option.content} /></span></button>; })}</div>;
}
