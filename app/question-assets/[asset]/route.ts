import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ asset: string }> }) {
  const { asset } = await params;
  const match = asset.match(/^TEST_030_Q(\d{2})\.webp$/);
  if (!match) return new NextResponse("Not found", { status: 404 });

  const questionNumber = Number(match[1]);
  if (questionNumber < 1 || questionNumber > 22) return new NextResponse("Not found", { status: 404 });

  const target = new URL(`/api/deductive-test1/question/${questionNumber}`, request.url);
  return NextResponse.redirect(target, 307);
}
