import snapshotManifest from "../data/question-snapshot-manifest.json";

type SnapshotManifest = {
  version: number;
  assets: Record<string, string>;
};

const manifest = snapshotManifest as SnapshotManifest;

// Snapshots are stored directly in the Next.js public folder.
const snapshotBaseUrl = (process.env.NEXT_PUBLIC_SNAPSHOT_BASE_URL ?? "/question-assets").replace(/\/$/, "");

function snapshotPrefix(testId: string, sourceFile: unknown): string {
  const file = String(sourceFile ?? "").trim().split("/").pop() ?? "";
  if (!file) return "";

  let prefix = manifest.assets[file];

  // This PDF is duplicated in the master dataset under two logical IDs.
  // The generated binaries are identical, so use the canonical prefix.
  if (testId === "TEST_004" && file === "Deductive-Logical-lst-1-questions.pdf") {
    prefix = "LOGICAL_030";
  }

  // The four dedicated deductive tests use the source PDFs below.
  // Keeping the mapping manifest-driven means the same resolver works for
  // every other test in the question bank too.
  if (testId === "TEST_030" && file === "DeductiveTest1-Questions.pdf") prefix = "DEDUCTIVE_031";
  if (testId === "TEST_031" && file === "DeductiveTest2-Questions.pdf") prefix = "DEDUCTIVE_032";
  if (testId === "TEST_032" && file === "DeductiveTest3-Questions.pdf") prefix = "DEDUCTIVE_033";
  if (testId === "TEST_033" && file === "DeductiveTest4-Questions.pdf") prefix = "DEDUCTIVE_034";

  return prefix ?? "";
}

export function questionSnapshotSrc(testId: string, sourceFile: unknown, questionNumber: number): string {
  const prefix = snapshotPrefix(testId, sourceFile);
  if (!prefix || !Number.isFinite(questionNumber) || questionNumber < 1) return "";
  return `${snapshotBaseUrl}/${prefix}_Q${String(questionNumber).padStart(3, "0")}.webp`;
}

export function solutionSnapshotSrc(testId: string, sourceFile: unknown, questionNumber: number): string {
  const prefix = snapshotPrefix(testId, sourceFile);
  if (!prefix || !Number.isFinite(questionNumber) || questionNumber < 1) return "";
  return `${snapshotBaseUrl}/${prefix}_Q${String(questionNumber).padStart(3, "0")}_solution.webp`;
}
