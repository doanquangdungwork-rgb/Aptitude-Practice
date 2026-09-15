import { existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const zipPath = resolve("assets/question-assets.zip");
const outputDir = resolve("public");

if (!existsSync(zipPath)) {
  throw new Error(`Missing question asset archive: ${zipPath}`);
}

mkdirSync(outputDir, { recursive: true });
execFileSync("unzip", ["-q", "-o", zipPath, "-d", outputDir], { stdio: "inherit" });
console.log("Question assets prepared.");
