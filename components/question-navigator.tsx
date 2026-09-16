"use client";

import { useEffect, useState } from "react";
import { getAttempt } from "../lib/progress";

export type QuestionNavStatus = "current" | "answered" | "unanswered" | "correct" | "wrong" | "skipped";

type Props = {
  count: number;
  current?: number;
  getStatus: (index: number) => QuestionNavStatus;
  onSelect: (index: number) => void;
  label?: string;
};

function formatElapsed(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function QuestionNavigator({ count, current = -1, getStatus, onSelect, label = "Questions" }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const testId = window.location.pathname.split("/").filter(Boolean).pop() || "";
    const readElapsed = () => {
      const attempt = getAttempt(testId);
      if (!attempt?.startedAt) return;
      setElapsed(Math.max(0, Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000)));
    };

    readElapsed();
    const timer = window.setInterval(readElapsed, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="question-navigator" aria-label={label}>
      <div className="question-navigator-head">
        <span className="eyebrow">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tabular-nums text-[#77736c]" aria-label={`Elapsed time ${formatElapsed(elapsed)}`}>
            {formatElapsed(elapsed)}
          </span>
          <span className="question-navigator-hint">Jump to any question</span>
        </div>
      </div>
      <div className="question-dots">
        {Array.from({ length: count }, (_, index) => {
          const status = getStatus(index);
          return (
            <button
              key={index}
              type="button"
              aria-label={`Go to question ${index + 1}`}
              aria-current={current === index ? "step" : undefined}
              className={`question-dot question-dot-${status}`}
              onClick={() => onSelect(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="question-navigator-legend">
        {label === "Questions" ? (
          <><span><i className="legend-dot answered" />Answered</span><span><i className="legend-dot unanswered" />Not answered</span></>
        ) : (
          <><span><i className="legend-dot correct" />Correct</span><span><i className="legend-dot wrong" />Wrong</span><span><i className="legend-dot skipped" />Skipped</span></>
        )}
      </div>
    </section>
  );
}
