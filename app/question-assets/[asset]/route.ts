import { NextResponse } from "next/server";

export const runtime = "nodejs";

const localPages: Record<number, string> = Object.fromEntries(
  Array.from({ length: 18 }, (_, i) => [i + 1, `TEST_030_P${String(i + 2).padStart(2, "0")}.webp`])
);

export async function GET(request: Request, { params }: { params: Promise<{ asset: string }> }) {
  const { asset } = await params;
  const match = asset.match(/^TEST_030_Q(\d{2})\.webp$/);
  if (!match) return new NextResponse("Not found", { status: 404 });

  const questionNumber = Number(match[1]);
  const localAsset = localPages[questionNumber];
  if (localAsset) return NextResponse.redirect(new URL(`/question-assets/${localAsset}`, request.url), 307);

  // Keep the old external fallback for the remaining questions until their source pages are added locally.
  if (questionNumber >= 1 && questionNumber <= 22) {
    return NextResponse.redirect(new URL(`/api/deductive-test1/question/${questionNumber}`, request.url), 307);
  }

  return new NextResponse("Not found", { status: 404 });
}
