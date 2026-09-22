import { answerOverrideFor } from "./answer-overrides";
import visual12AnswerKeys from "../data/visual-12-answer-keys.json";

export type AnswerKeyStatus = "verified_override" | "visual_solution" | "source" | "quarantined_uniform_source";

const visualAnswerFor = (questionId: string): string => {
  const value = (visual12AnswerKeys as Record<string, { answer?: string }>)[questionId]?.answer;
  return typeof value === "string" ? value : "";
};

export function resolveAnswerKey(testId: string, questionId: string, sourceAnswer: unknown, sourceAnswersInTest?: unknown[]) {
  const override = answerOverrideFor(questionId);
  if (override?.answer != null) return { answer: override.answer, status: "verified_override" as const };

  const raw = String(sourceAnswer ?? "").trim().toUpperCase();
  const peers = (sourceAnswersInTest ?? []).map(value => String(value ?? "").trim().toUpperCase()).filter(Boolean);
  const uniform = peers.length >= 3 && new Set(peers).size === 1;

  if (uniform) {
    const visualAnswer = visualAnswerFor(questionId);
    if (visualAnswer) {
      return { answer: visualAnswer, status: "visual_solution" as const };
    }
    console.warn(`[answer-key] ${testId}: uniform source key detected; question ${questionId} is quarantined until a verified solution key is supplied.`);
    return { answer: "", status: "quarantined_uniform_source" as const };
  }

  return { answer: sourceAnswer, status: "source" as const };
}
