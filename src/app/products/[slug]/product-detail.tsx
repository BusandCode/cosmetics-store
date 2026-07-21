"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { placeholderImage } from "@/lib/product-image";
import { useCart } from "@/store/cart";

type Variant = { id: string; label: string; priceKobo: number; stock: number };
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  category: { name: string };
  variants: Variant[];
};

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, setQuantity, items } = useCart();
  const [selected, setSelected] = useState<Variant | null>(
    product.variants.find((v) => v.stock > 0) ?? product.variants[0] ?? null
  );

  const imgSrc = product.images[0] || placeholderImage(product.slug);
  const cartLine = selected ? items.find((i) => i.variantId === selected.id) : undefined;

  function handleAddToCart() {
    if (!selected || selected.stock === 0) return;
    addItem({
      variantId: selected.id,
      productName: product.name,
      productSlug: product.slug,
      variantLabel: selected.label,
      priceKobo: selected.priceKobo,
      image: imgSrc,
      maxStock: selected.stock,
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-baseline justify-between">
        <Link href="/" className="text-sm hover:underline">
          ← Back
        </Link>
        <Link href="/cart" className="text-sm hover:underline">
          Cart {items.length > 0 && `(${items.reduce((s, i) => s + i.quantity, 0)})`}
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-10 mt-8">
        <div className="relative aspect-square bg-neutral-100 border border-black overflow-hidden">
          <Image src={imgSrc} alt={product.name} fill className="object-cover" sizes="50vw" />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              {product.category.name}
            </p>
            <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
          </div>

          <p className="text-sm text-neutral-700 leading-relaxed">{product.description}</p>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-neutral-500">Choose an option</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  disabled={variant.stock === 0}
                  onClick={() => setSelected(variant)}
                  className={`border border-black px-4 py-2 text-sm transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed ${
                    selected?.id === variant.id ? "bg-black text-white" : "hover:bg-black hover:text-white"
                  }`}
                >
                  {variant.label} — ₦{(variant.priceKobo / 100).toLocaleString()}
                  {variant.stock === 0 && " · sold out"}
                </button>
              ))}
            </div>
          </div>

          {cartLine ? (
            <div className="space-y-2">
              <div className="flex items-center border border-black w-full">
                <button
                  onClick={() => setQuantity(cartLine.variantId, cartLine.quantity - 1)}
                  className="flex-1 py-3 text-sm hover:bg-black hover:text-white transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-medium">{cartLine.quantity}</span>
                <button
                  onClick={() => setQuantity(cartLine.variantId, cartLine.quantity + 1)}
                  disabled={cartLine.quantity >= cartLine.maxStock}
                  className="flex-1 py-3 text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => router.push("/cart")}
                className="w-full border border-black py-3 text-sm font-medium hover:bg-black hover:text-white transition-colors"
              >
                In cart — view cart
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!selected || selected.stock === 0}
              className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}