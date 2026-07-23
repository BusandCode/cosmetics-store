import { prisma } from "@/lib/prisma";
import { BANK_DETAILS } from "@/lib/payment-config";
import { OrderTracker } from "@/components/order-tracker";
import { notFound } from "next/navigation";
import Link from "next/link";

// export default async function OrderPage(props: { params: Promise<{ id: string }> }) {
//   const params = await props.params;
//   const order = await prisma.order.findUnique({
//     where: { id: params.id },
//     include: { items: { include: { variant: { include: { product: true } } } } },
//   });
export default async function OrderPage({ params,}: {params: Promise<{ id: string }>;}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
  if (!order) notFound();

  const totalNaira = (order.totalKobo / 100).toLocaleString();

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm hover:underline">
        ← Store
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mt-6">
        Order <span className="font-mono">{order.reference}</span>
      </h1>

      <div className="mt-8 mb-8">
        <OrderTracker status={order.status} />
      </div>

      {order.status === "PENDING" && (
        <div className="border border-black mt-8 p-6 space-y-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Pay by bank transfer</p>
          <dl className="text-sm space-y-1.5">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Bank</dt>
              <dd>{BANK_DETAILS.bankName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Account number</dt>
              <dd className="font-mono">{BANK_DETAILS.accountNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Account name</dt>
              <dd>{BANK_DETAILS.accountName}</dd>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-neutral-200">
              <dt>Amount</dt>
              <dd>₦{totalNaira}</dd>
            </div>
          </dl>
          <p className="text-xs bg-black text-white p-3">
            Use <span className="font-mono">{order.reference}</span> as your transfer description so we can match your payment.
          </p>
          <form action={`/api/orders/${order.id}/mark-paid`} method="post">
            <button type="submit" className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-neutral-800 transition-colors">
              I've made the transfer
            </button>
          </form>
        </div>
      )}

      {order.status === "AWAITING_CONFIRMATION" && (
        <p className="text-sm text-neutral-600 mt-8 border border-black p-4">
          Confirming your payment — this usually takes a few minutes during business hours.
        </p>
      )}

      {order.status === "PAID" && (
        <p className="text-sm mt-8 bg-black text-white p-4">
          Payment confirmed. Your order is being processed.
        </p>
      )}

      {order.status === "PROCESSING" && (
        <p className="text-sm mt-8 border border-black p-4">
          Your order is being packed for shipping.
        </p>
      )}

      {order.status === "SHIPPED" && (
        <p className="text-sm mt-8 border border-black p-4">
          Your order is on its way.
        </p>
      )}

      {order.status === "DELIVERED" && (
        <p className="text-sm mt-8 bg-black text-white p-4">
          Delivered. Thanks for shopping with us.
        </p>
      )}

      {order.status === "CANCELLED" && (
        <p className="text-sm mt-8 border border-black p-4 text-neutral-600">
          This order was cancelled.
        </p>
      )}

      <ul className="divide-y divide-neutral-200 mt-8">
        {order.items.map((item) => (
          <li key={item.id} className="py-3 flex justify-between text-sm">
            <span>
              {item.variant.product.name} ({item.variant.label}) × {item.quantity}
            </span>
            <span>₦{((item.priceKobo * item.quantity) / 100).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}