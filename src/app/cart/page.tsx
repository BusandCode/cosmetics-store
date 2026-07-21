"use client";

import { useCart, cartTotalKobo } from "@/store/cart";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, setQuantity } = useCart();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = cartTotalKobo(items);

  async function handleCheckout() {
    setError(null);
    setPlacing(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      }),
    });

    setPlacing(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push("/login?next=/cart");
        return;
      }
      setError(data.error ?? "Could not place order");
      return;
    }

    const { order } = await res.json();
    useCart.getState().clear();
    router.push(`/orders/${order.id}`);
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-neutral-500 mb-4">Your cart is empty.</p>
        <Link href="/" className="underline text-sm">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm hover:underline">
        ← Continue shopping
      </Link>
      <h1 className="text-2xl font-bold tracking-tight mt-6 mb-8">Cart</h1>

      <ul className="divide-y divide-neutral-200 border-y border-black">
        {items.map((item) => (
          <li key={item.variantId} className="py-4 flex gap-4">
            <div className="relative w-20 h-20 bg-neutral-100 flex-shrink-0">
              <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="80px" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.productName}</p>
              <p className="text-xs text-neutral-500 mb-2">{item.variantLabel}</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-black">
                  <button
                    onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                    className="w-7 h-7 text-sm hover:bg-black hover:text-white transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    className="w-7 h-7 text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.variantId)}
                  className="text-xs text-neutral-400 hover:text-black underline"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="text-sm font-medium">
              ₦{((item.priceKobo * item.quantity) / 100).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-baseline mt-6 mb-8">
        <span className="text-sm text-neutral-500">Total</span>
        <span className="text-xl font-bold">₦{(total / 100).toLocaleString()}</span>
      </div>

      {error && <p className="text-sm text-red-700 mb-4">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={placing}
        className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
      >
        {placing ? "Placing order…" : "Checkout"}
      </button>
    </div>
  );
}