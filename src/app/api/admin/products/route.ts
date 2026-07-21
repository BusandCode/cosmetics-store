import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, categoryId, images, variants } = body as {
    name: string;
    description: string;
    categoryId: string;
    images: string[];
    variants: { label: string; sku: string; priceKobo: number; stock: number }[];
  };

  if (!name || !categoryId || !variants?.length) {
    return NextResponse.json({ error: "Name, category, and at least one variant are required" }, { status: 400 });
  }

  let slug = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        images: images.filter(Boolean),
        categoryId,
        variants: {
          create: variants.map((v) => ({
            label: v.label,
            sku: v.sku,
            priceKobo: v.priceKobo,
            stock: v.stock,
          })),
        },
      },
    });
    return NextResponse.json({ id: product.id });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "A variant SKU is already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}