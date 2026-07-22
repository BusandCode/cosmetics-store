"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Image as ImageIcon,
  Tag,
  Package,
  DollarSign,
  Layers,
  AlertCircle
} from "lucide-react";

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
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateVariant(index: number, field: keyof VariantInput, value: string | number) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index
          ? { 
              ...v, 
              [field]: field === "priceKobo" || field === "stock" 
                ? Number(value) 
                : value 
            }
          : v
      )
    );
  }

  function addVariant() {
    setVariants((prev) => [...prev, { ...emptyVariant }]);
  }

  function removeVariant(index: number) {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    // Validate variants
    const invalidVariants = variants.some(v => 
      !v.label.trim() || !v.sku.trim() || v.priceKobo <= 0 || v.stock < 0
    );
    
    if (invalidVariants) {
      setError("Please fill in all variant fields correctly (price must be > 0, stock >= 0)");
      setSaving(false);
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      categoryId,
      images: imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
      variants: variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        label: v.label.trim(),
        sku: v.sku.trim(),
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

    setSuccess(mode === "create" ? "Product created successfully!" : "Product updated successfully!");
    
    if (mode === "create") {
      // Reset form for create mode
      setName("");
      setDescription("");
      setCategoryId(categories[0]?.id ?? "");
      setImagesText("");
      setVariants([{ ...emptyVariant }]);
    } else {
      // Redirect after edit
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1500);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-2xl font-serif font-semibold tracking-tight">
            {mode === "create" ? "New Product" : "Edit Product"}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {mode === "create" 
              ? "Add a new product to your store" 
              : "Update product details and variants"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {mode === "edit" && (
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:text-black transition-colors duration-200"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <div>
            <p className="font-medium text-sm">Success</p>
            <p className="text-sm">{success}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-neutral-400" />
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-neutral-500 mb-1.5">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Luxury Deodorant"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-neutral-500 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe your product..."
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-neutral-500 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200 appearance-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-neutral-400" />
              Product Images
            </h3>
            
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-neutral-500 mb-1.5">
                Image URLs <span className="text-neutral-400 text-xs font-normal">(one per line)</span>
              </label>
              <textarea
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                rows={3}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200"
              />
              <p className="text-xs text-neutral-400 mt-2">
                Falls back to a placeholder if no images are provided
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Variants */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-400" />
                Variants <span className="text-red-500">*</span>
              </h3>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1.5 text-xs font-medium text-white bg-black px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors duration-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Variant
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, i) => (
                <div key={variant.id ?? i} className="relative p-4 border border-neutral-200 rounded-lg hover:border-black transition-colors duration-200">
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-red-500 transition-colors duration-200"
                      aria-label="Remove variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Label <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        placeholder="e.g. 50ml, Large, Blue"
                        value={variant.label}
                        onChange={(e) => updateVariant(i, "label", e.target.value)}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        SKU <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        placeholder="SKU-001"
                        value={variant.sku}
                        onChange={(e) => updateVariant(i, "sku", e.target.value)}
                        disabled={!!variant.id}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200 ${
                          variant.id ? 'border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed' : 'border-neutral-300'
                        }`}
                      />
                      {variant.id && (
                        <p className="text-[10px] text-neutral-400 mt-1">SKU cannot be changed</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Price (₦) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          required
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="0.00"
                          value={variant.priceKobo ? variant.priceKobo / 100 : ""}
                          onChange={(e) => updateVariant(i, "priceKobo", Number(e.target.value) * 100)}
                          className="w-full border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          required
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          value={variant.stock}
                          onChange={(e) => updateVariant(i, "stock", e.target.value)}
                          className="w-full border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {variants.length === 0 && (
                <div className="text-center py-8 text-neutral-400 text-sm">
                  <p>No variants added yet</p>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="mt-2 text-black underline hover:no-underline"
                  >
                    Add your first variant
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="md:hidden flex flex-col gap-3 pt-4 border-t border-neutral-200">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 text-sm font-medium hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg w-full"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="flex items-center justify-center gap-2 px-6 py-3 text-sm text-neutral-600 hover:text-black transition-colors duration-200 rounded-lg border border-neutral-300 w-full"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}