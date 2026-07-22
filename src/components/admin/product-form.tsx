"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VariantInput = {
  id?: string;
  label: string;
  sku: string;
  priceKobo: number;
  stock: number;
};

type Category = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  productId?: string;
  categories: Category[];
  initial?: {
    name: string;
    description: string;
    categoryId: string;
    images: string[];
    variants: VariantInput[];
  };
};

const emptyVariant: VariantInput = { label: "", sku: "", priceKobo: 0, stock: 0 };

export function ProductForm({ mode, productId, categories, initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [imagesText, setImagesText] = useState((initial?.images ?? []).join("\n"));
  const [variants, setVariants] = useState<VariantInput[]>(
    initial?.variants?.length ? initial.variants : [{ ...emptyVariant }]
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateVariant(index: number, field: keyof VariantInput, value: string) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index
          ? { ...v, [field]: field === "priceKobo" || field === "stock" ? Number(value) : value }
          : v
      )
    );
  }

  function addVariant() {
    setVariants((prev) => [...prev, { ...emptyVariant }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name,
      description,
      categoryId,
      images: imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
      variants: variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        label: v.label,
        sku: v.sku,
        priceKobo: v.priceKobo,
        stock: v.stock,
      })),
    };

    const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save product");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-neutral-500">Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-black px-3 py-2 mt-1 text-sm" />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-neutral-500">Description</label>
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-black px-3 py-2 mt-1 text-sm" />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-neutral-500">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border border-black px-3 py-2 mt-1 text-sm bg-white">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-neutral-500">
            Image URLs (one per line, optional — falls back to a placeholder photo)
          </label>
          <textarea value={imagesText} onChange={(e) => setImagesText(e.target.value)} rows={2} placeholder="https://..." className="w-full border border-black px-3 py-2 mt-1 text-sm font-mono text-xs" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Variants</p>
          <button type="button" onClick={addVariant} className="text-xs underline">+ Add variant</button>
        </div>

        {variants.map((variant, i) => (
          <div key={variant.id ?? i} className="grid grid-cols-4 gap-2 border border-black p-3">
            <input required placeholder="Label (e.g. 50ml)" value={variant.label} onChange={(e) => updateVariant(i, "label", e.target.value)} className="border border-black px-2 py-1.5 text-sm col-span-2" />
            <input required placeholder="SKU" value={variant.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="border border-black px-2 py-1.5 text-sm" disabled={!!variant.id} />
            <input required type="number" placeholder="Price (₦)" value={variant.priceKobo ? variant.priceKobo / 100 : ""} onChange={(e) => updateVariant(i, "priceKobo", String(Number(e.target.value) * 100))} className="border border-black px-2 py-1.5 text-sm" />
            <input required type="number" placeholder="Stock" value={variant.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} className="border border-black px-2 py-1.5 text-sm col-span-4" />
          </div>
        ))}
        <p className="text-xs text-neutral-400">
          SKU can't be changed once a variant exists — add a new variant instead of editing the SKU.
        </p>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={saving} className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50">
        {saving ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
      </button>
    </form>
  );
}