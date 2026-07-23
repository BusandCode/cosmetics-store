import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status === "PENDING") {
    await prisma.order.update({
      where: { id },
      data: { status: "AWAITING_CONFIRMATION" },
    });
  }

  return NextResponse.redirect(new URL(`/orders/${id}`, req.url), { status: 303 });
}