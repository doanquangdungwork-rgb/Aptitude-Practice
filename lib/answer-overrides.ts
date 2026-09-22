import { gunzipSync, inflateRawSync } from "node:zlib";

const DATA = "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";

export type AnswerOverride = {
  answer: string | string[];
  optionCount?: number;
  optionIds?: string[];
  responseType?: string;
  figureChoice?: boolean;
};


function parseEmbeddedJson(json: string): Record<string, AnswerOverride> {
  const source = json.trim();
  try {
    return JSON.parse(source) as Record<string, AnswerOverride>;
  } catch (error) {
    if (!(error instanceof SyntaxError) || !/after JSON/.test(error.message)) throw error;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = 0; i < source.length; i++) {
      const ch = source[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') { inString = true; continue; }
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          const candidate = source.slice(0, i + 1);
          return JSON.parse(candidate) as Record<string, AnswerOverride>;
        }
      }
    }
    throw error;
  }
}

let cache: Record<string, AnswerOverride> | null = null;

export function answerOverrideFor(id: string): AnswerOverride | null {
  if (cache) return cache[id] ?? null;
  const compressed = Buffer.from(DATA, "base64");
  let json: string;
  try {
    json = gunzipSync(compressed).toString("utf8");
  } catch {
    // The embedded payload has a damaged gzip checksum. Decode the raw deflate stream
    // without trusting the broken gzip trailer/checksum.
    json = inflateRawSync(compressed.subarray(10)).toString("utf8");
  }
  cache = parseEmbeddedJson(json);
  return cache[id] ?? null;
}
