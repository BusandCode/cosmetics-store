import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Log in to leave a review" }, { status: 401 });
  }

  const { rating, comment } = await req.json();
  if (!rating || rating < 1 || rating > 5 || !comment?.trim()) {
    return NextResponse.json({ error: "A rating and comment are required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.review.create({
    data: {
      productId: product.id,
      name: session.user.name || session.user.email!.split("@")[0],
      rating,
      comment: comment.trim(),
    },
  });

  return NextResponse.json({ ok: true });
}