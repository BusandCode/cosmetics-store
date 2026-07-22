import { prisma } from "@/lib/prisma";
import { placeholderImage } from "@/lib/product-image";
import Link from "next/link";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Link href="/admin/products/new" className="bg-black text-white text-sm font-medium px-4 py-2 hover:bg-neutral-800 transition-colors">
          + New product
        </Link>
      </div>

      <div className="border border-black divide-y divide-neutral-200">
        {products.map((product) => {
          const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
          const priceRange = product.variants.length > 0
            ? [...new Set(product.variants.map((v) => v.priceKobo))].sort((a, b) => a - b)
            : [];
          const imgSrc = product.images[0] || placeholderImage(product.slug, 200);

          return (
            <div key={product.id} className="flex items-center gap-4 p-4">
              <div className="relative w-14 h-14 bg-neutral-100 flex-shrink-0">
                <img src={imgSrc} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                {!product.active && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <span className="text-[8px] uppercase tracking-widest">Off</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-neutral-500">
                  {product.category.name} · {product.variants.length} variant{product.variants.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="text-sm text-right w-28 flex-shrink-0">
                {priceRange.length > 0 && (
                  <p>
                    ₦{(priceRange[0] / 100).toLocaleString()}
                    {priceRange.length > 1 && ` – ₦${(priceRange[priceRange.length - 1] / 100).toLocaleString()}`}
                  </p>
                )}
                <p className={`text-xs ${totalStock === 0 ? "text-red-700" : "text-neutral-500"}`}>
                  {totalStock === 0 ? "Out of stock" : `${totalStock} in stock`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/admin/products/${product.id}/edit`} className="border border-black text-xs uppercase tracking-wide px-3 py-2 hover:bg-black hover:text-white transition-colors">
                  Edit
                </Link>
                <form action={`/api/admin/products/${product.id}/toggle`} method="post">
                  <button className="border border-black text-xs uppercase tracking-wide px-3 py-2 hover:bg-black hover:text-white transition-colors">
                    {product.active ? "Deactivate" : "Activate"}
                  </button>
                </form>
              </div>
            </div>
          );
        })}

        {products.length === 0 && (
          <p className="p-8 text-center text-sm text-neutral-400">No products yet — add your first one.</p>
        )}
      </div>

      <p className="text-xs text-neutral-400 mt-6">
        Deactivated products are hidden from the storefront but kept for order history — nothing is ever hard-deleted, since past orders reference them.
      </p>
    </div>
  );
}