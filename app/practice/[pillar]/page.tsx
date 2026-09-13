"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { questionsForPillar, pillarMap } from "../../../lib/data";

function PracticeSession() {
  const { pillar } = useParams<{ pillar: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const subtype = searchParams.get("subtype") || undefined;
  const qs = useMemo(
    () => questionsForPillar(pillar, subtype).slice(0, 20),
    [pillar, subtype],
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const q = qs[index];

  if (!q) {
    return <div className="p-12">No indexed questions for this filter yet.</div>;
  }

  const opts = (q.o || []) as any[];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex justify-between text-sm">
        <b>{pillarMap[pillar]}</b>
        <span>
          {index + 1}/{qs.length}
        </span>
      </div>

      <article className="mt-6 rounded-3xl border bg-white p-8">
        <div className="whitespace-pre-wrap text-lg leading-8">{q.t}</div>

        {opts.length > 0 && (
          <div className="mt-8 grid gap-3">
            {opts.map((o: any, optionIndex: number) => {
              const value = typeof o === "string" ? o : o.text || o.label || o.option || "";
              return (
                <button
                  key={optionIndex}
                  onClick={() => setAnswers({ ...answers, [q.id]: value })}
                  className={`rounded-2xl border p-4 text-left ${
                    answers[q.id] === value ? "border-black" : "border-neutral-200"
                  }`}
                >
                  {String.fromCharCode(65 + optionIndex)}. {value}
                </button>
              );
            })}
          </div>
        )}
      </article>

      <div className="mt-5 flex justify-between">
        <button
          onClick={() => router.push("/practice")}
          className="rounded-full border px-5 py-2.5"
        >
          Exit
        </button>
        {index < qs.length - 1 ? (
          <button
            onClick={() => setIndex(index + 1)}
            className="rounded-full bg-black px-6 py-2.5 text-white"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => router.push("/history")}
            className="rounded-full bg-black px-6 py-2.5 text-white"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
}

export default function PracticeSessionPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-6 py-12">Loading practice…</div>}>
      <PracticeSession />
    </Suspense>
  );
}
