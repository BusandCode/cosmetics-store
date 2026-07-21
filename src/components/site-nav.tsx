"use client";

import { useState } from "react";
import Link from "next/link";
import { CartBadge } from "@/components/cart-badge";
import LogoutButton from "@/components/logout-button";

type Category = { id: string; name: string; slug: string };

type Props = {
  categories: Category[];
  userEmail: string | null | undefined;
  logoutAction: () => Promise<void>;
};

export default function SiteNav({ categories, userEmail, logoutAction }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden sm:flex text-sm items-center gap-6">
        {categories.map((c) => (
          <a key={c.id} href={`#${c.slug}`} className="hover:underline text-neutral-500">
            {c.name}
          </a>
        ))}
        {userEmail && (
          <Link href="/orders" className="hover:underline text-neutral-500">
            Your orders
          </Link>
        )}
        <CartBadge />
        {userEmail ? (
          <>
            <span className="text-neutral-400 text-xs">{userEmail}</span>
            <LogoutButton action={logoutAction} />
          </>
        ) : (
          <Link href="/login" className="hover:underline">
            Log in
          </Link>
        )}
      </nav>

      {/* Mobile: cart + menu icon */}
      <div className="flex sm:hidden items-center gap-4">
        <CartBadge />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-1"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed top-0 left-0 h-screen w-screen z-50 bg-white sm:hidden">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-10 border-b border-black pb-6">
              <span className="text-sm font-semibold uppercase tracking-widest">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-5 text-lg">
              {categories.map((c) => (
                <a key={c.id} href={`#${c.slug}`} onClick={() => setOpen(false)} className="hover:underline">
                  {c.name}
                </a>
              ))}
              {userEmail && (
                <Link href="/orders" onClick={() => setOpen(false)} className="hover:underline">
                  Your orders
                </Link>
              )}
            </div>

            <div className="mt-10 pt-6 border-t border-black text-sm">
              {userEmail ? (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-xs">{userEmail}</span>
                  <LogoutButton action={logoutAction} />
                </div>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="hover:underline">
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}