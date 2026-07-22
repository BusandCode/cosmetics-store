"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { RatingSquares } from "@/components/rating-squares";
import { placeholderImage } from "@/lib/product-image";
// import { useCartStore } from "@/store/cart";
import { useCart } from "@/store/cart";

type Variant = { id: string; label: string; sku: string; priceKobo: number; stock: number };
type Review = { id: string; name: string; rating: number; comment: string; createdAt: Date };
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  category: { name: string; slug: string };
  variants: Variant[];
  reviews: Review[];
};

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // const addItem = useCartStore((s: any) => s.addItem);
  const addItem = useCart((s) => s.addItem);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const images = product.images.length > 0 ? product.images : [placeholderImage(product.slug)];
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewError(null);
    if (rating === 0 || !comment.trim()) {
      setReviewError("Pick a rating and add a comment");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/products/${product.slug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setReviewError(data.error || "Couldn't submit review");
      return;
    }
    setRating(0);
    setComment("");
    router.refresh();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Link href="/" className="text-xs uppercase tracking-widest text-neutral-500 hover:underline">
        ← Back
      </Link>

      <div className="grid sm:grid-cols-2 gap-10 mt-6 mb-16">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square bg-neutral-100 mb-2">
            <Image src={images[activeImg]} alt={product.name} fill className="object-cover" sizes="50vw" />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative aspect-square bg-neutral-100 ${i === activeImg ? "ring-2 ring-black" : ""}`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="10vw" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">{product.category.name}</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight mb-3">{product.name}</h1>

          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <RatingSquares value={avgRating} />
              <span className="text-xs text-neutral-500">
                {avgRating.toFixed(1)} · {product.reviews.length} review{product.reviews.length === 1 ? "" : "s"}
              </span>
            </div>
          )}

          <p className="text-sm text-neutral-600 leading-relaxed mb-6">{product.description}</p>

          {/* Variant spec table */}
          <table className="w-full text-sm border-collapse mb-6">
            <tbody>
              {product.variants.map((v) => (
                <tr key={v.id} className="border-b border-neutral-200">
                  <td className="py-2">
                    <button
                      onClick={() => setVariantId(v.id)}
                      className={`text-left ${v.id === variantId ? "font-semibold" : "text-neutral-500"}`}
                      disabled={v.stock === 0}
                    >
                      {v.label} {v.stock === 0 && <span className="text-xs">(sold out)</span>}
                    </button>
                  </td>
                  <td className="py-2 text-right">₦{(v.priceKobo / 100).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            disabled={!variant || variant.stock === 0}
            onClick={() =>
              addItem({
                variantId: variant.id,
                productName: product.name,
                productSlug: product.slug,
                variantLabel: variant.label,
                priceKobo: variant.priceKobo,
                image: images[0],
                maxStock: variant.stock,
              })
            }
            className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40"
          >
            {variant?.stock === 0 ? "Sold out" : "Add to cart"}
          </button>
          
        </div>
      </div>

      {/* Reviews */}
      <section className="border-t border-black pt-10">
        <h2 className="font-serif text-xl font-semibold tracking-tight mb-6">Reviews</h2>

        <div className="grid sm:grid-cols-2 gap-10">
          <div className="space-y-6">
            {product.reviews.length === 0 && (
              <p className="text-sm text-neutral-400">No reviews yet — be the first.</p>
            )}
            {product.reviews.map((r) => (
              <div key={r.id} className="border-b border-neutral-200 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{r.name}</span>
                  <RatingSquares value={r.rating} size={8} />
                </div>
                <p className="text-sm text-neutral-600">{r.comment}</p>
              </div>
            ))}
          </div>

          <form onSubmit={submitReview} className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-neutral-500">Leave a review</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  className={`w-6 h-6 ${i <= rating ? "bg-[#6B1D1D]" : "border border-neutral-300"}`}
                  aria-label={`${i} star`}
                />
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="What did you think?"
              className="w-full border border-black px-3 py-2 text-sm"
            />
            {reviewError && <p className="text-sm text-red-700">{reviewError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="text-xs uppercase tracking-wide bg-black text-white px-4 py-2 hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}