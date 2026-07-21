import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OrderHistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm hover:underline">
        ← Store
      </Link>
      <h1 className="text-2xl font-bold tracking-tight mt-6 mb-8">Your orders</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-neutral-500">No orders yet.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 border-y border-black">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex justify-between items-center py-4 hover:bg-neutral-50 -mx-2 px-2 transition-colors"
              >
                <div>
                  <p className="text-sm font-mono">{order.reference}</p>
                  <p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">₦{(order.totalKobo / 100).toLocaleString()}</p>
                  <span className="text-xs uppercase tracking-wide text-neutral-500">
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}