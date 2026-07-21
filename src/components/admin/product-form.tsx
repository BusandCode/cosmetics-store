"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Variant = { id?: string; label: string; sku: string; price: string; stock: string };

type Props = {
  mode: "new" | "edit";
  productId?: string;
  categories: { id: string; name: string }[];
  initial?: {
    name: string;
    description: string;
    categoryId: string;
    images: string[];
    variants: { id: string; label: string; sku: string; priceKobo: number; stock: number }[];
  };
};

export default function ProductForm({ mode, productId, categories, initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [imagesText, setImagesText] = useState((initial?.images ?? []).join("\n"));
  const [variants, setVariants] = useState<Variant[]>(
    initial?.variants.map((v) => ({
      id: v.id,
      label: v.label,
      sku: v.sku,
      price: (v.priceKobo / 100).toString(),
      stock: v.stock.toString(),
    })) ?? [{ label: "", sku: "", price: "", stock: "" }]
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateVariant(i: number, field: keyof Variant, value: string) {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  }

  function addVariant() {
    setVariants((prev) => [...prev, { label: "", sku: "", price: "", stock: "" }]);
  }

  function removeVariant(i: number) {
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !categoryId || variants.length === 0) {
      setError("Name, category, and at least one variant are required");
      return;
    }
    for (const v of variants) {
      if (!v.label.trim() || !v.sku.trim() || !v.price || !v.stock) {
        setError("Every variant needs a label, SKU, price, and stock");
        return;
      }
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      categoryId,
      images: imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
      variants: variants.map((v) => ({
        id: v.id,
        label: v.label.trim(),
        sku: v.sku.trim(),
        priceKobo: Math.round(parseFloat(v.price) * 100),
        stock: parseInt(v.stock, 10),
      })),
    };

    const url = mode === "new" ? "/api/admin/products" : `/api/admin/products/${productId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="text-xs uppercase tracking-widest text-neutral-500">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-black px-3 py-2 mt-1 text-sm"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-neutral-500">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border border-black px-3 py-2 mt-1 text-sm"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-neutral-500">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border border-black px-3 py-2 mt-1 text-sm bg-white"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-neutral-500">
          Image URLs (one per line)
        </label>
        <textarea
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          rows={3}
          className="w-full border border-black px-3 py-2 mt-1 text-sm font-mono"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-widest text-neutral-500">Variants</label>
          <button type="button" onClick={addVariant} className="text-xs underline">
            + Add variant
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_100px_80px_auto] gap-2 items-center">
              <input
                placeholder="Label (e.g. 50ml)"
                value={v.label}
                onChange={(e) => updateVariant(i, "label", e.target.value)}
                className="border border-black px-2 py-2 text-sm"
              />
              <input
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariant(i, "sku", e.target.value)}
                className="border border-black px-2 py-2 text-sm font-mono"
              />
              <input
                placeholder="Price ₦"
                type="number"
                step="0.01"
                value={v.price}
                onChange={(e) => updateVariant(i, "price", e.target.value)}
                className="border border-black px-2 py-2 text-sm"
              />
              <input
                placeholder="Stock"
                type="number"
                value={v.stock}
                onChange={(e) => updateVariant(i, "stock", e.target.value)}
                className="border border-black px-2 py-2 text-sm"
              />
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="text-xs text-red-700 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white text-sm font-medium px-6 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-50"
      >
        {loading ? "Saving…" : mode === "new" ? "Create product" : "Save changes"}
      </button>
    </form>
  );
}