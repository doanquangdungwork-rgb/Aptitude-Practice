export type Attempt = {
  id: string;
  testId: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  answers: Record<string, string>;
};

const key = (suffix: string) => `aptitude:${suffix}`;

function read<T>(name: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key(name)) || "null") ?? fallback; } catch { return fallback; }
}
function write(name: string, value: unknown) {
  if (typeof window !== "undefined") localStorage.setItem(key(name), JSON.stringify(value));
}

export function getAttempts(): Attempt[] { return read<Attempt[]>("attempts", []); }
export function getAttempt(testId: string) { return getAttempts().find((x) => x.testId === testId && !x.completedAt); }
export function getCompletedAttempt(testId: string) { return getAttempts().find((x) => x.testId === testId && !!x.completedAt); }
export function saveAttempt(attempt: Attempt) {
  const all = getAttempts().filter((x) => x.id !== attempt.id);
  write("attempts", [attempt, ...all]);
}
export function completeAttempt(id: string, answers: Record<string, string>, durationSeconds?: number) {
  const now = new Date().toISOString();
  write("attempts", getAttempts().map((x) => x.id === id ? { ...x, answers, updatedAt: now, completedAt: now, durationSeconds } : x));
}

export function getBookmarks(): string[] { return read<string[]>("bookmarks", []); }
export function toggleBookmark(questionId: string) {
  const current = getBookmarks();
  const next = current.includes(questionId) ? current.filter((id) => id !== questionId) : [...current, questionId];
  write("bookmarks", next);
  return next.includes(questionId);
}
export function getWrongQuestions(): string[] { return read<string[]>("wrong", []); }
export function setWrongQuestions(ids: string[]) { write("wrong", Array.from(new Set(ids))); }
