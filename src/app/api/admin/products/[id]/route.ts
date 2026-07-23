import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string(),
  images: z.array(z.string()).default([]),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().min(1),
        sku: z.string().min(1),
        priceKobo: z.number().int().positive(),
        stock: z.number().int().min(0),
      })
    )
    .min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product data", details: parsed.error.flatten() }, { status: 400 });
  }
  const { name, description, categoryId, images, variants } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: { name, description, categoryId, images },
    });

    for (const variant of variants) {
      if (variant.id) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { label: variant.label, sku: variant.sku, priceKobo: variant.priceKobo, stock: variant.stock },
        });
      } else {
        await tx.productVariant.create({
          data: { ...variant, productId: id },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}