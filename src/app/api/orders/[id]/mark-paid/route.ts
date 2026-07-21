import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Customer-facing: "I've made the transfer." This never sets status to PAID —
// only an admin confirming against their bank alert can do that.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status === "PENDING") {
    await prisma.order.update({
      where: { id: params.id },
      data: { status: "AWAITING_CONFIRMATION" },
    });
  }

  // Plain HTML <form> POST needs a redirect back to a viewable page,
  // not a JSON body — the browser renders whatever we return here.
  return NextResponse.redirect(new URL(`/orders/${params.id}`, req.url), { status: 303 });
}