"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { RatingSquares } from "@/components/rating-squares";
import { placeholderImage } from "@/lib/product-image";
import { useCart } from "@/store/cart";
import { ArrowRight, ShoppingCart, Search, X, Check } from "lucide-react";

const ACCENT = "#0B4F3D";

type Variant = { id: string; label: string; priceKobo: number; stock: number };
type Review = { rating: number };
export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  images: string[];
  variants: Variant[];
  reviews: Review[];
};

export function lowestPriceKobo(variants: Variant[]) {
  return Math.min(...variants.map((v) => v.priceKobo));
}

export function totalStockOf(variants: Variant[]) {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}

export function avgRatingOf(reviews: Review[]) {
  return reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
}

function cheapestInStockVariant(variants: Variant[]) {
  const inStock = variants.filter((v) => v.stock > 0);
  if (inStock.length === 0) return null;
  return inStock.reduce((min, v) => (v.priceKobo < min.priceKobo ? v : min), inStock[0]);
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-neutral-100 rounded-full transition-colors duration-200"
        aria-label="Search products"
      >
        <Search className="w-5 h-5 text-neutral-600" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4 pt-20 sm:pt-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-b-2 border-black focus:outline-none bg-transparent"
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery("");
                  setResults([]);
                }}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-neutral-500">Searching...</div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => {
                        setIsOpen(false);
                        setSearchQuery("");
                        setResults([]);
                      }}
                      className="flex items-center gap-4 p-3 hover:bg-neutral-50 rounded-lg transition-colors duration-200"
                    >
                      <div className="relative w-16 h-16 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={product.images[0] || placeholderImage(product.slug)}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-neutral-500 line-clamp-1">{product.description}</p>
                        <p className="text-sm font-medium mt-1">
                          ₦{(lowestPriceKobo(product.variants) / 100).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="text-center py-8 text-neutral-500">
                  No products found for "{searchQuery}"
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const variant = cheapestInStockVariant(product.variants);

  function handleAddToCart() {
    if (!variant) return;
    addItem({
      variantId: variant.id,
      productName: product.name,
      productSlug: product.slug,
      variantLabel: variant.label,
      priceKobo: variant.priceKobo,
      image: product.images[0] || placeholderImage(product.slug),
      maxStock: variant.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (!variant) return null;

  return (
    <button
      onClick={handleAddToCart}
      disabled={added}
      className="flex items-center gap-1.5 text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-70"
    >
      {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
      {added ? "Added" : "Add to cart"}
    </button>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const lowestPrice = lowestPriceKobo(product.variants);
  const totalStock = totalStockOf(product.variants);
  const imgSrc = product.images[0] || placeholderImage(product.slug);
  const avgRating = avgRatingOf(product.reviews);

  return (
    <div className="group bg-white p-3 sm:p-4 flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-neutral-200">
      <Link href={`/products/${product.slug}`} className="flex-1">
        <div className="relative aspect-square bg-neutral-100 overflow-hidden mb-3">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {totalStock === 0 && (
            <span className="absolute top-2 left-2 bg-black text-white text-[10px] uppercase tracking-widest px-2 py-1">
              Sold out
            </span>
          )}
          {totalStock > 0 && totalStock <= 5 && (
            <span
              className="absolute top-2 left-2 text-white text-[10px] uppercase tracking-widest px-2 py-1"
              style={{ backgroundColor: ACCENT }}
            >
              Low stock
            </span>
          )}
        </div>
        <p className="text-sm font-medium line-clamp-2">{product.name}</p>
        <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">{product.description}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-medium">from ₦{(lowestPrice / 100).toLocaleString()}</p>
          {product.reviews.length > 0 && (
            <div className="flex items-center gap-1">
              <RatingSquares value={avgRating} size={7} />
            </div>
          )}
        </div>
      </Link>

      {totalStock > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <AddToCartButton product={product} />
        </div>
      )}
    </div>
  );
}

export function SectionHeading({
  title,
  meta,
  viewMoreHref,
}: {
  title: string;
  meta?: string;
  viewMoreHref?: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight">{title}</h2>
        <div className="flex items-center gap-4">
          {meta && (
            <span className="text-xs text-neutral-400 uppercase tracking-widest">{meta}</span>
          )}
          {viewMoreHref && (
            <Link
              href={viewMoreHref}
              className="text-xs text-neutral-600 hover:text-black flex items-center gap-1 transition-colors duration-200"
            >
              View more
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
      <div className="w-10 h-[3px] mt-2" style={{ backgroundColor: ACCENT }} />
    </div>
  );
}