import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [pendingCount, productCount, lowStockCount] = await Promise.all([
    prisma.order.count({ where: { status: { in: ["PENDING", "AWAITING_CONFIRMATION"] } } }),
    prisma.product.count({ where: { active: true } }),
    prisma.productVariant.count({ where: { stock: { lte: 5, gt: 0 } } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-3 gap-px bg-black border border-black">
        <Link href="/admin/orders" className="bg-white hover:bg-black hover:text-white transition-colors p-6">
          <p className="text-3xl font-bold">{pendingCount}</p>
          <p className="text-xs uppercase tracking-widest mt-1 opacity-70">Orders awaiting action</p>
        </Link>
        <Link href="/admin/products" className="bg-white hover:bg-black hover:text-white transition-colors p-6">
          <p className="text-3xl font-bold">{productCount}</p>
          <p className="text-xs uppercase tracking-widest mt-1 opacity-70">Active products</p>
        </Link>
        <Link href="/admin/products" className="bg-white hover:bg-black hover:text-white transition-colors p-6">
          <p className="text-3xl font-bold">{lowStockCount}</p>
          <p className="text-xs uppercase tracking-widest mt-1 opacity-70">Variants low on stock</p>
        </Link>
      </div>
    </div>
  );
}