import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();

  // Toggle active only
  if (typeof body.active === "boolean" && Object.keys(body).length === 1) {
    await prisma.product.update({ where: { id: params.id }, data: { active: body.active } });
    return NextResponse.json({ ok: true });
  }

  const { name, description, categoryId, images, variants } = body as {
    name: string;
    description: string;
    categoryId: string;
    images: string[];
    variants: { id?: string; label: string; sku: string; priceKobo: number; stock: number }[];
  };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: params.id },
        data: { name, description, categoryId, images: images.filter(Boolean) },
      });

      const existingVariants = await tx.productVariant.findMany({ where: { productId: params.id } });
      const keptIds = variants.filter((v) => v.id).map((v) => v.id!);

      // Remove variants dropped from the form, but never ones with order history
      const toRemove = existingVariants.filter((ev) => !keptIds.includes(ev.id));
      for (const v of toRemove) {
        const orderItemCount = await tx.orderItem.count({ where: { variantId: v.id } });
        if (orderItemCount === 0) {
          await tx.productVariant.delete({ where: { id: v.id } });
        }
        // if it has order history, silently keep it rather than fail the whole save
      }

      for (const v of variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: { label: v.label, sku: v.sku, priceKobo: v.priceKobo, stock: v.stock },
          });
        } else {
          await tx.productVariant.create({
            data: { productId: params.id, label: v.label, sku: v.sku, priceKobo: v.priceKobo, stock: v.stock },
          });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "A variant SKU is already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to save product" }, { status: 500 });
  }
}