import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetail } from "./product-detail";

export default async function ProductPage(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { variants: true, category: true },
  });
  if (!product || !product.active) notFound();

  return <ProductDetail product={product} />;
}