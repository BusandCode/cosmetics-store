import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { payment: true },
  });
  if (order && order.payment && order.status !== "PAID") {
    await prisma.$transaction([
      prisma.order.update({ where: { id }, data: { status: "PAID" } }),
      prisma.payment.update({
        where: { orderId: id },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
      }),
    ]);
  }

  return NextResponse.redirect(new URL("/admin/orders", req.url), { status: 303 });
}