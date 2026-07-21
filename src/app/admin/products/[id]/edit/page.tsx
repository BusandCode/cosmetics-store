import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/product-form";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id }, include: { variants: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Edit product</h1>
      <ProductForm
        mode="edit"
        productId={product.id}
        categories={categories}
        initial={{
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          images: product.images,
          variants: product.variants,
        }}
      />
    </div>
  );
}