import snapshotManifest from "../data/question-snapshot-manifest.json";

type SnapshotManifest = {
  version: number;
  assets: Record<string, string>;
};

const manifest = snapshotManifest as SnapshotManifest;
const snapshotBaseUrl = (process.env.NEXT_PUBLIC_SNAPSHOT_BASE_URL ?? "").replace(/\/$/, "");

export function questionSnapshotSrc(testId: string, sourceFile: unknown, questionNumber: number): string {
  const file = String(sourceFile ?? "").trim().split("/").pop() ?? "";
  if (!file || !Number.isFinite(questionNumber) || questionNumber < 1 || !snapshotBaseUrl) return "";

  // The generated asset pack is flat: PREFIX_Q001.webp, PREFIX_Q002.webp, ...
  // The manifest keeps the authoritative source-PDF -> prefix relationship.
  let prefix = manifest.assets[file];

  // This PDF is duplicated in the master dataset under two logical IDs.
  // The generated binaries are identical, so use the first canonical prefix.
  if (testId === "TEST_004" && file === "Deductive-Logical-lst-1-questions.pdf") {
    prefix = "LOGICAL_030";
  }

  if (!prefix) return "";
  return `${snapshotBaseUrl}/${prefix}_Q${String(questionNumber).padStart(3, "0")}.webp`;
}
