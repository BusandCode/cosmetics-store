import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderReference, ACTIVE_PAYMENT_METHOD } from "@/lib/payment-config";
import { z } from "zod";

const bodySchema = z.object({
  items: z.array(z.object({ variantId: z.string(), quantity: z.number().int().positive() })),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Please log in to check out" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
  }
  const { items } = parsed.data;

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((i) => i.variantId) } },
  });
  if (variants.length !== items.length) {
    return NextResponse.json({ error: "One or more items no longer exist" }, { status: 400 });
  }
  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId)!;
    if (variant.stock < item.quantity) {
      return NextResponse.json({ error: `${variant.label} is out of stock` }, { status: 409 });
    }
  }

  let address = await prisma.address.findFirst({ where: { userId } });
  if (!address) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    address = await prisma.address.create({
      data: { userId, fullName: user.name ?? user.email, phone: user.phone ?? "", line1: "", city: "", state: "" },
    });
  }

  const totalKobo = items.reduce((sum, item) => {
    const variant = variants.find((v) => v.id === item.variantId)!;
    return sum + variant.priceKobo * item.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        addressId: address!.id,
        totalKobo,
        reference: generateOrderReference(),
        status: "PENDING",
        items: {
          create: items.map((item) => {
            const variant = variants.find((v) => v.id === item.variantId)!;
            return { variantId: item.variantId, quantity: item.quantity, priceKobo: variant.priceKobo };
          }),
        },
        payment: { create: { method: ACTIVE_PAYMENT_METHOD, amountKobo: totalKobo, status: "PENDING" } },
      },
      include: { payment: true, items: true },
    });

    for (const item of items) {
      await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
    }

    return created;
  });

  return NextResponse.json({ order }, { status: 201 });
}