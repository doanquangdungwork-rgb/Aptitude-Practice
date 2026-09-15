"use client";

import { useState } from "react";

type ReferenceMaterial = { id: string; assetRef: string; label: string };

export default function ReferenceViewer({ materials, compact = false }: { materials: ReferenceMaterial[]; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  if (!materials.length) return null;
  const current = materials[Math.min(page, materials.length - 1)];

  return (
    <section className={`reference-viewer ${open ? "reference-viewer-open" : ""} ${compact ? "reference-viewer-compact" : ""}`}>
      <div className="reference-viewer-bar">
        <div>
          <span className="eyebrow">Reference data</span>
          <p className="reference-viewer-title">Reading material · {current.label}</p>
        </div>
        <button className="outline-action" onClick={() => setOpen(v => !v)}>{open ? "Hide data" : "View data ↗"}</button>
      </div>
      {open && <div className="reference-viewer-body">
        <div className="reference-viewer-tabs">
          {materials.map((m, i) => <button key={m.id} onClick={() => setPage(i)} className={i === page ? "active" : ""}>{m.label}</button>)}
        </div>
        <div className="reference-viewer-image-wrap">
          <img src={`/question-assets/${current.assetRef}.webp`} alt={current.label} className="reference-viewer-image" />
        </div>
      </div>}
    </section>
  );
}
