import { prisma } from "@/lib/prisma";

const NEXT_LABEL: Record<string, string> = {
  PAID: "Mark processing",
  PROCESSING: "Mark shipped",
  SHIPPED: "Mark delivered",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["PENDING", "AWAITING_CONFIRMATION", "PAID", "PROCESSING", "SHIPPED"] } },
    include: { user: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Orders</h1>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b border-black">
            <th className="py-3 font-semibold uppercase text-xs tracking-widest">Reference</th>
            <th className="font-semibold uppercase text-xs tracking-widest">Customer</th>
            <th className="font-semibold uppercase text-xs tracking-widest">Amount</th>
            <th className="font-semibold uppercase text-xs tracking-widest">Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-neutral-200">
              <td className="py-3 font-mono">{order.reference}</td>
              <td>{order.user.email}</td>
              <td>₦{(order.totalKobo / 100).toLocaleString()}</td>
              <td>
                <span className="text-xs uppercase tracking-wide border border-black px-2 py-1">
                  {order.status.replace("_", " ")}
                </span>
              </td>
              <td className="text-right">
                {order.status === "AWAITING_CONFIRMATION" && (
                  <form action={`/api/admin/orders/${order.id}/confirm`} method="post">
                    <button className="bg-black text-white text-xs uppercase tracking-wide px-3 py-2 hover:bg-neutral-800 transition-colors">
                      Confirm payment
                    </button>
                  </form>
                )}
                {NEXT_LABEL[order.status] && (
                  <form action={`/api/admin/orders/${order.id}/status`} method="post">
                    <button className="border border-black text-xs uppercase tracking-wide px-3 py-2 hover:bg-black hover:text-white transition-colors">
                      {NEXT_LABEL[order.status]}
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="py-10 text-center text-neutral-400">
                Nothing in progress.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}