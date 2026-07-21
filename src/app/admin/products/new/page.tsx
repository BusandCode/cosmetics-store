import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-8">New product</h1>
      <ProductForm mode="new" categories={categories} />
    </div>
  );
}