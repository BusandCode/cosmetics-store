import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-black text-white text-xs uppercase tracking-wide px-4 py-2 hover:bg-neutral-800 transition-colors"
        >
          + New product
        </Link>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b border-black">
            <th className="py-3 font-semibold uppercase text-xs tracking-widest">Product</th>
            <th className="font-semibold uppercase text-xs tracking-widest">Category</th>
            <th className="font-semibold uppercase text-xs tracking-widest">Variants</th>
            <th className="font-semibold uppercase text-xs tracking-widest">Total stock</th>
            <th className="font-semibold uppercase text-xs tracking-widest">Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
            return (
              <tr key={product.id} className={`border-b border-neutral-200 ${!product.active ? "opacity-40" : ""}`}>
                <td className="py-3">{product.name}</td>
                <td className="text-neutral-500">{product.category.name}</td>
                <td className="text-neutral-500">{product.variants.map((v) => v.label).join(", ")}</td>
                <td className={totalStock === 0 ? "text-red-700" : ""}>{totalStock}</td>
                <td className="text-xs uppercase tracking-wide">{product.active ? "Active" : "Inactive"}</td>
                <td className="text-right space-x-3 whitespace-nowrap">
                  <Link href={`/admin/products/${product.id}/edit`} className="text-xs underline">
                    Edit
                  </Link>
                  <form action={`/api/admin/products/${product.id}/toggle`} method="post" className="inline">
                    <button className="text-xs underline text-neutral-600 hover:text-black">
                      {product.active ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </td>
              </tr>
            );
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="py-10 text-center text-neutral-400">
                No products yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}