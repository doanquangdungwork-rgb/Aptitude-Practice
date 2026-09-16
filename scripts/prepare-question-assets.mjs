import { existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const outputDir = resolve("public");
const questionAssetDir = resolve("public/question-assets");
const archives = [
  { name: "Aptitude-question-assets-final.zip", target: outputDir, required: true },
  { name: "TEST_030_source-question-images.zip", target: questionAssetDir, required: false },
];

mkdirSync(outputDir, { recursive: true });
mkdirSync(questionAssetDir, { recursive: true });

for (const { name, target, required } of archives) {
  const zipPath = resolve(name);
  if (!existsSync(zipPath)) {
    if (required) throw new Error(`Missing question asset archive: ${zipPath}`);
    continue;
  }
  if (name === "Aptitude-question-assets-final.zip") {
    const listing = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" });
    const matches = listing.split("\n").filter((x) => /TEST_030|Deductive|deductive/i.test(x)).slice(0, 200);
    console.log("DED_ASSET_ARCHIVE_MATCHES", JSON.stringify(matches));
  }
  execFileSync("unzip", ["-q", "-o", zipPath, "-d", target], { stdio: "inherit" });
}

console.log("Question assets prepared.");
