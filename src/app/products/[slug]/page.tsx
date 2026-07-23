import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetail from "./product-detail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: true,
      category: true,
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!product || !product.active) notFound();

  return (
    <ProductDetail
      product={{
        ...product,
        reviews: product.reviews.map((r) => ({
          id: r.id,
          name: r.user.name ?? r.user.email.split("@")[0],
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        })),
      }}
    />
  );
}