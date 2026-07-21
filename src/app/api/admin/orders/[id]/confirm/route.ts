import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { requireAdmin } from "@/lib/auth"; // wire up once role check is added

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { payment: true },
  });
  if (order && order.payment && order.status !== "PAID") {
    await prisma.$transaction([
      prisma.order.update({ where: { id: params.id }, data: { status: "PAID" } }),
      prisma.payment.update({
        where: { orderId: params.id },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
      }),
    ]);
  }

  return NextResponse.redirect(new URL("/admin/orders", req.url), { status: 303 });
}