"use client";
import { useEffect, useMemo, useState } from "react";

type ReferenceMaterial = { id: string; assetRef: string; label: string };
type ReferenceViewerProps = { materials: ReferenceMaterial[]; initialIndex?: number; compact?: boolean; text?: string; textLabel?: string; eyebrowLabel?: string };
function referenceAssetSrc(assetRef: string) { return `/question-assets/${assetRef.includes(".") ? assetRef : `${assetRef}.webp`}`; }

export default function ReferenceViewer({ materials, initialIndex = 0, compact = false, text, textLabel, eyebrowLabel = "Reference" }: ReferenceViewerProps) {
  const [page, setPage] = useState(Math.min(initialIndex, Math.max(materials.length - 1, 0)));
  const [zoom, setZoom] = useState(100);
  useEffect(() => { setPage(Math.min(initialIndex, Math.max(materials.length - 1, 0))); }, [initialIndex, materials.length]);
  const current = useMemo(() => materials[Math.min(page, materials.length - 1)], [materials, page]);
  const hasText = Boolean(text && text.trim());
  if (typeof window !== "undefined" && window.location.pathname.includes("/tests/TEST_030") && hasText && !materials.length) return null;
  if (!materials.length && !hasText) return null;
  const zoomIn = () => setZoom(v => Math.min(180, v + 10));
  const zoomOut = () => setZoom(v => Math.max(60, v - 10));
  const displayLabel = textLabel || current?.label || "Question material";
  return <section className={`reference-viewer ${compact ? "reference-viewer-compact" : ""}`} aria-label="Question reference">
    <div className="reference-toolbar"><div className="reference-heading"><span className="eyebrow">{eyebrowLabel}</span><span className="reference-label">{displayLabel}</span></div><div className="reference-zoom"><button type="button" onClick={zoomOut} disabled={zoom <= 60}>−</button><button type="button" onClick={() => setZoom(100)} className="reference-zoom-value">{zoom}%</button><button type="button" onClick={zoomIn} disabled={zoom >= 180}>+</button></div></div>
    {materials.length > 1 && <div className="reference-tabs" role="tablist">{materials.map((m,i)=><button key={m.id} type="button" role="tab" aria-selected={i===page} onClick={()=>setPage(i)} className={i===page?"active":""}>{m.label}</button>)}</div>}
    <div className="reference-stage"><div className="reference-canvas">{hasText ? <div className="reference-text-content" style={{ width: `${zoom}%` }}>{text}</div> : <img src={referenceAssetSrc(current.assetRef)} alt={current.label} style={{ width:`${zoom}%` }} />}</div></div>
  </section>;
}
