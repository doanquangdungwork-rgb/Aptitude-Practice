import { existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const outputDir = resolve("public");
const archives = ["Aptitude-question-assets-final.zip", "TEST_030_source-question-images.zip"];

mkdirSync(outputDir, { recursive: true });
for (const name of archives) {
  const zipPath = resolve(name);
  if (!existsSync(zipPath)) {
    if (name === "Aptitude-question-assets-final.zip") throw new Error(`Missing question asset archive: ${zipPath}`);
    continue;
  }
  execFileSync("unzip", ["-q", "-o", zipPath, "-d", outputDir], { stdio: "inherit" });
}
console.log("Question assets prepared.");
