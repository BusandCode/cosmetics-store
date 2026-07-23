import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Please log in to leave a review" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Pick a rating and add a comment" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      variant: { productId: product.id },
      order: { userId, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
    },
  });
  if (!hasPurchased) {
    return NextResponse.json(
      { error: "Only customers who've purchased this product can review it" },
      { status: 403 }
    );
  }

  const review = await prisma.review.upsert({
    where: { productId_userId: { productId: product.id, userId } },
    update: { rating: parsed.data.rating, comment: parsed.data.comment },
    create: { productId: product.id, userId, rating: parsed.data.rating, comment: parsed.data.comment },
  });

  return NextResponse.json({ review }, { status: 201 });
}