import { allQuestions } from "./data";
import snapshotManifest from "../data/question-snapshot-manifest.json";

type SnapshotManifest = {
  version: number;
  assets: Record<string, string>;
};

type LegacySourceQuestion = {
  id?: string;
  testId?: string;
  sourceFile?: string;
};

const manifest = snapshotManifest as SnapshotManifest;

// The source-PDF snapshots are named from the canonical test prefix in the
// master dataset (e.g. DEDUCTIVE_031_Q001.webp). Build the lookup from the
// same question data so every test can use the exact same renderer.
const sourcePrefix = new Map<string, string>();
for (const raw of allQuestions as LegacySourceQuestion[]) {
  const file = String(raw.sourceFile ?? "").trim().split("/").pop() ?? "";
  const prefix = String(raw.testId ?? "").trim() || String(raw.id ?? "").split("_").slice(0, 2).join("_");
  if (file && prefix && !sourcePrefix.has(file)) sourcePrefix.set(file, prefix);
}

export function questionSnapshotSrc(testId: string, sourceFile: unknown, questionNumber: number): string {
  const file = String(sourceFile ?? "").trim().split("/").pop() ?? "";
  if (!file || !Number.isFinite(questionNumber) || questionNumber < 1) return "";

  // TEST_004 is a canonical override backed by the same source PDF that is
  // duplicated in the master dataset under two logical IDs. Both binaries
  // are identical; use the first canonical source prefix consistently.
  if (testId === "TEST_004" && file === "Deductive-Logical-lst-1-questions.pdf") {
    return `/question-assets/LOGICAL_030_Q${String(questionNumber).padStart(3, "0")}.webp`;
  }

  const prefix = sourcePrefix.get(file);
  if (prefix) {
    return `/question-assets/${prefix}_Q${String(questionNumber).padStart(3, "0")}.webp`;
  }

  // Keep the legacy manifest as a safe fallback for source files that are not
  // represented in the master question dataset yet.
  if (!manifest.assets[file]) return "";
  let template = manifest.assets[file];
  if (file === "NumericalReasoningTest18-Questions.pdf") {
    template = "/question-snapshots/source_pdfs_Numerical_Reasoning_NumericalReasoningTest18_Questions/Q{number}.png";
  }
  return template.replace("{number}", String(questionNumber).padStart(2, "0"));
}
