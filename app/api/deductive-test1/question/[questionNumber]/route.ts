import { NextResponse } from "next/server";

const SOURCE = "https://www.coursehero.com/file/178107887/DeductiveTest1-Questionspdf/";

export async function GET(_request: Request, { params }: { params: Promise<{ questionNumber: string }> }) {
  const { questionNumber } = await params;
  const question = Number(questionNumber);
  if (!Number.isInteger(question) || question < 1 || question > 22) return new NextResponse("Not found", { status: 404 });

  const pdfPage = question + 1;
  const source = await fetch(SOURCE, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 86400 } });
  if (!source.ok) return new NextResponse("Source unavailable", { status: 502 });
  const html = await source.text();
  const pattern = new RegExp(`/asset/bg/blur/[^\\\"']*/splits/page-${pdfPage}-html-bg-[^\\\"']+\\.webp`);
  const match = html.match(pattern);
  if (!match) return new NextResponse("Question image not found", { status: 404 });

  const image = await fetch(new URL(match[0], "https://www.coursehero.com"), { next: { revalidate: 86400 } });
  if (!image.ok) return new NextResponse("Image unavailable", { status: 502 });
  return new NextResponse(await image.arrayBuffer(), {
    headers: {
      "Content-Type": image.headers.get("content-type") || "image/webp",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
