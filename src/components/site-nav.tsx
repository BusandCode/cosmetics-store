"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CartBadge } from "@/components/cart-badge";
import LogoutButton from "@/components/logout-button";
import { Menu, X, User, ShoppingBag, LogOut, ChevronRight } from "lucide-react";

type Category = { id: string; name: string; slug: string };

type Props = {
  categories: Category[];
  userEmail: string | null | undefined;
  logoutAction: () => Promise<void>;
};

export default function SiteNav({ categories, userEmail, logoutAction }: Props) {
  const [open, setOpen] = useState(false);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-8">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`#${c.slug}`}
            className="text-sm text-neutral-600 hover:text-black transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full"
          >
            {c.name}
          </a>
        ))}
        {userEmail && (
          <Link
            href="/orders"
            className="text-sm text-neutral-600 hover:text-black transition-colors duration-200 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            Orders
          </Link>
        )}
        <CartBadge />
        {userEmail ? (
          <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
            <span className="text-sm text-neutral-500 truncate max-w-[120px]">
              {userEmail}
            </span>
            <LogoutButton action={logoutAction} />
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm bg-black text-white px-4 py-2 hover:bg-neutral-800 transition-colors duration-200"
          >
            Log in
          </Link>
        )}
      </nav>

      {/* Mobile: Cart + Menu Button */}
      <div className="flex md:hidden items-center gap-3">
        <CartBadge />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl animate-slide-in">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-100">
                <span className="text-sm font-semibold uppercase tracking-widest text-neutral-800">
                  Menu
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="space-y-1">
                  {categories.map((c) => (
                    <a
                      key={c.id}
                      href={`#${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between py-3 px-3 hover:bg-neutral-50 rounded-lg transition-colors duration-200 group"
                    >
                      <span className="text-base font-medium">{c.name}</span>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors duration-200" />
                    </a>
                  ))}
                </div>

                {userEmail && (
                  <div className="mt-6 pt-6 border-t border-neutral-100">
                    <Link
                      href="/orders"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 py-3 px-3 hover:bg-neutral-50 rounded-lg transition-colors duration-200"
                    >
                      <ShoppingBag className="w-5 h-5 text-neutral-600" />
                      <span className="text-base font-medium">Your orders</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-100 p-4 sm:p-6 bg-neutral-50/50">
                {userEmail ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg">
                      <User className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-600 truncate flex-1">
                        {userEmail}
                      </span>
                    </div>
                    <LogoutButton action={logoutAction} />
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-black text-white py-3 px-4 hover:bg-neutral-800 transition-colors duration-200 rounded-lg"
                  >
                    <User className="w-4 h-4" />
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}