import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

async function walk(dir: string, root: string, out: string[]) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, root, out);
    else if (/TEST_030|Deductive|deductive/i.test(full)) out.push(full.slice(root.length + 1));
  }
}

export async function GET() {
  const root = join(process.cwd(), "public");
  const files: string[] = [];
  await walk(root, root, files);
  return NextResponse.json({ count: files.length, files: files.slice(0, 500) });
}
