"use client";

export type QuestionNavStatus = "current" | "answered" | "unanswered" | "correct" | "wrong" | "skipped";

type Props = {
  count: number;
  current?: number;
  getStatus: (index: number) => QuestionNavStatus;
  onSelect: (index: number) => void;
  label?: string;
};

export default function QuestionNavigator({ count, current = -1, getStatus, onSelect, label = "Questions" }: Props) {
  return (
    <section className="question-navigator" aria-label={label}>
      <div className="question-navigator-head">
        <span className="eyebrow">{label}</span>
        <span className="question-navigator-hint">Jump to any question</span>
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
