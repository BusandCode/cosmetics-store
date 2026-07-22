import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import Link from "next/link";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link href="/admin/products" className="text-sm hover:underline">← Products</Link>
      <h1 className="text-2xl font-bold tracking-tight mt-4 mb-8">New product</h1>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}