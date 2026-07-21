import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const NEXT_STATUS: Record<string, string> = {
  PAID: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  const next = order ? NEXT_STATUS[order.status] : undefined;

  if (order && next) {
    await prisma.order.update({ where: { id: params.id }, data: { status: next as any } });
  }

  return NextResponse.redirect(new URL("/admin/orders", req.url), { status: 303 });
}