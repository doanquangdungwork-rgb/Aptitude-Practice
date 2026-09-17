import snapshotManifest from "../data/question-snapshot-manifest.json";

type SnapshotManifest = {
  version: number;
  assets: Record<string, string>;
};

const manifest = snapshotManifest as SnapshotManifest;

export function questionSnapshotSrc(testId: string, sourceFile: unknown, questionNumber: number): string {
  if (["TEST_030", "TEST_031", "TEST_032", "TEST_033"].includes(testId)) {
    return `/question-assets/${testId}_Q${String(questionNumber).padStart(2, "0")}.png`;
  }

  const file = String(sourceFile ?? "").trim().split("/").pop() ?? "";
  if (!file || !manifest.assets[file]) return "";

  const template = manifest.assets[file];
  return template.replace("{number}", String(questionNumber).padStart(2, "0"));
}
