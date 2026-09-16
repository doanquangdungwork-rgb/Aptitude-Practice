import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const allowedAsset = /^[A-Za-z0-9._-]+\.(?:webp|svg|png|jpg|jpeg)$/i;

export async function GET(_request: Request, { params }: { params: Promise<{ asset: string }> }) {
  const { asset } = await params;
  if (!allowedAsset.test(asset) || asset.includes("..")) return new NextResponse("Not found", { status: 404 });

  const filePath = path.join(process.cwd(), "public", "question-assets", asset);
  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(asset).toLowerCase();
    const contentType = ext === ".webp" ? "image/webp" : ext === ".svg" ? "image/svg+xml" : ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "application/octet-stream";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
