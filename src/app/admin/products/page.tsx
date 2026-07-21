import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Products</h1>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b border-black">
            <th className="py-3 font-semibold uppercase text-xs tracking-widest">Product</th>
            <th className="font-semibold uppercase text-xs tracking-widest">Category</th>
            <th className="font-semibold uppercase text-xs tracking-widest">Variants</th>
            <th className="font-semibold uppercase text-xs tracking-widest">Total stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
            return (
              <tr key={product.id} className="border-b border-neutral-200">
                <td className="py-3">{product.name}</td>
                <td className="text-neutral-500">{product.category.name}</td>
                <td className="text-neutral-500">{product.variants.map((v) => v.label).join(", ")}</td>
                <td className={totalStock === 0 ? "text-red-700" : ""}>{totalStock}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="text-xs text-neutral-400 mt-6">
        Read-only for now — add/edit/delete isn't wired up yet. Use `prisma db seed` or Prisma Studio to manage products in the meantime.
      </p>
    </div>
  );
}