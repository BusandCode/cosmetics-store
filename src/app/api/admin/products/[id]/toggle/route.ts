import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await prisma.product.update({
    where: { id: params.id },
    data: { active: !product.active },
  });

  return NextResponse.redirect(new URL("/admin/products", req.url), { status: 303 });
}