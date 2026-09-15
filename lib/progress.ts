export type Attempt = {
  id: string;
  testId: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  answers: Record<string, unknown>;
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
export function getCompletedAttempt(testId: string) {
  return getAttempts()
    .filter((x) => x.testId === testId && !!x.completedAt)
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0];
}
export function saveAttempt(attempt: Attempt) { write("attempts", [attempt, ...getAttempts().filter((x) => x.id !== attempt.id)]); }
export function completeAttempt(id: string, answers: Record<string, unknown>, durationSeconds?: number) {
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

export function getStarredTests(): string[] { return read<string[]>("starred-tests", []); }
export function toggleStarredTest(testId: string) {
  const current = getStarredTests();
  const next = current.includes(testId) ? current.filter((id) => id !== testId) : [...current, testId];
  write("starred-tests", next);
  return next.includes(testId);
}

export function getPracticeDays(userId: string): string[] { return read<string[]>(`practice-days:${userId}`, []); }
export function recordPracticeDay(userId: string, date = new Date()) {
  const day = new Date(date);
  const isoDay = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
  const current = getPracticeDays(userId);
  const next = Array.from(new Set([...current, isoDay])).sort();
  write(`practice-days:${userId}`, next);
}
