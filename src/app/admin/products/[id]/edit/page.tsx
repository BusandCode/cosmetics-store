import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id }, include: { variants: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-sm hover:underline">← Products</Link>
      <h1 className="text-2xl font-bold tracking-tight mt-4 mb-8">Edit {product.name}</h1>
      <ProductForm
        mode="edit"
        productId={product.id}
        categories={categories}
        initial={{
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          images: product.images,
          variants: product.variants.map((v) => ({ id: v.id, label: v.label, sku: v.sku, priceKobo: v.priceKobo, stock: v.stock })),
        }}
      />
    </div>
  );
}