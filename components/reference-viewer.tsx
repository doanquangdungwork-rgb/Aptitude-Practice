"use client";

import { useEffect, useState } from "react";

type ReferenceMaterial = { id: string; assetRef: string; label: string };

export default function ReferenceViewer({ materials, initialIndex = 0, compact = false }: { materials: ReferenceMaterial[]; initialIndex?: number; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(Math.min(initialIndex, Math.max(materials.length - 1, 0)));
  useEffect(() => setPage(Math.min(initialIndex, Math.max(materials.length - 1, 0))), [initialIndex, materials.length]);
  if (!materials.length) return null;
  const current = materials[Math.min(page, materials.length - 1)];

  return (
    <section className={`mt-4 overflow-hidden rounded-2xl border border-[#e7e5de] bg-white/80 backdrop-blur ${compact ? "" : ""}`}>
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div><span className="eyebrow">Reference data</span><p className="mt-0.5 text-xs font-medium text-[#77736b]">Reading material · {current.label}</p></div>
        <button className="outline-action shrink-0" onClick={() => setOpen(v => !v)}>{open ? "Hide data" : "View data ↗"}</button>
      </div>
      {open && <div className="border-t border-[#e7e5de] px-4 pb-4 pt-3">
        <div className="mb-3 flex gap-1.5 overflow-x-auto">{materials.map((m, i) => <button key={m.id} onClick={() => setPage(i)} className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold ${i === page ? "border-[#242522] bg-[#242522] text-white" : "border-[#e7e5de] bg-white text-[#8c8981]"}`}>{m.label}</button>)}</div>
        <div className="overflow-auto rounded-xl border border-[#e7e5de] bg-[#fbfaf6] p-2"><img src={`/question-assets/${current.assetRef}.webp`} alt={current.label} className="mx-auto block max-h-[620px] w-auto max-w-full object-contain" /></div>
      </div>}
    </section>
  );
}
