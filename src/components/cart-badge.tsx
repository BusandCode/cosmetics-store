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
    <Link href="/cart" className="relative inline-flex items-center p-1" aria-label="Cart">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h2l1.6 9.6a2 2 0 0 0 2 1.7h8.8a2 2 0 0 0 2-1.6L21 9H6" />
        <circle cx="9" cy="20" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="17" cy="20" r="1.5" fill="currentColor" stroke="none" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] leading-none rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
          {count}
        </span>
      )}
    </Link>
  );
}