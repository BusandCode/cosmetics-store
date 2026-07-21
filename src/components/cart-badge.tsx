"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { useEffect, useState } from "react";

export function CartBadge() {
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <Link href="/cart" className="hover:underline font-medium relative">
      Cart
      {count > 0 && (
        <span className="ml-1 inline-flex items-center justify-center bg-black text-white text-[10px] rounded-full w-4 h-4">
          {count}
        </span>
      )}
    </Link>
  );
}