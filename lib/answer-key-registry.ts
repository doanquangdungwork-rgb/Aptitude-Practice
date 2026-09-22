import { answerOverrideFor } from "./answer-overrides";

export type AnswerKeyStatus = "verified_override" | "source" | "quarantined_uniform_source";

export function resolveAnswerKey(testId: string, questionId: string, sourceAnswer: unknown, sourceAnswersInTest?: unknown[]) {
  const override = answerOverrideFor(questionId);
  if (override?.answer != null) return { answer: override.answer, status: "verified_override" as const };
  const raw = String(sourceAnswer ?? "").trim().toUpperCase();
  const peers = (sourceAnswersInTest ?? []).map(value => String(value ?? "").trim().toUpperCase()).filter(Boolean);
  const uniform = peers.length >= 3 && new Set(peers).size === 1;
  if (uniform) {
    console.warn(`[answer-key] ${testId}: uniform source key detected; question ${questionId} is quarantined until a verified solution key is supplied.`);
    return { answer: "", status: "quarantined_uniform_source" as const };
  }
  return { answer: sourceAnswer, status: "source" as const };
}