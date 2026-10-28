"use client";

import { use, type FormEvent, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Plus, Star as StarIcon, Trash2, Upload } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";
import { RichTextEditor } from "../../../_components/rich-text-editor";

interface Variant { id: number; name: string; sku: string; price: string; compare_at_price: string | null; stock: number; is_active: boolean; order: number; }
interface ProductImage { id: number; image: string | null; alt_text: string; is_primary: boolean; order: number; }
interface ProductDetail { id: number; name: string; slug: string; description: string; categories: number[]; is_active: boolean; is_featured: boolean; variants: Variant[]; images: ProductImage[]; }
interface CategoryOption { id: number; name: string; children: CategoryOption[]; }

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: adminKeys.product(Number(id)),
    queryFn: () => adminFetch<ProductDetail>(`/admin/products/${id}`),
  });

  const { data: categories } = useQuery({
    queryKey: adminKeys.categories(),
    queryFn: async () => {
      const res = await adminFetch<{ results: CategoryOption[] } | CategoryOption[]>("/admin/categories");
      return Array.isArray(res) ? res : res.results;
    },
  });

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [description, setDescription] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (product && !initialized) {
    setSelectedCategories(product.categories);
    setDescription(product.description);
    setInitialized(true);
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminKeys.product(Number(id)) });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminFetch(`/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { invalidate(); toast.success("Product saved"); },
    onError: () => toast.error("Failed to save product"),
  });

  const addVariantMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminFetch(`/admin/products/${id}/variants`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { invalidate(); toast.success("Variant added"); },
    onError: () => toast.error("Failed to add variant"),
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (vid: number) => adminFetch(`/admin/variants/${vid}`, { method: "DELETE" }),
    onSuccess: () => { invalidate(); toast.success("Variant deleted"); },
    onError: () => toast.error("Failed to delete variant"),
  });

  const uploadImageMutation = useMutation({
    mutationFn: (formData: FormData) => adminFetch(`/admin/products/${id}/images`, { method: "POST", body: formData }),
    onSuccess: () => { invalidate(); toast.success("Image uploaded"); },
    onError: () => toast.error("Failed to upload image"),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imgId: number) => adminFetch(`/admin/images/${imgId}`, { method: "DELETE" }),
    onSuccess: () => { invalidate(); toast.success("Image deleted"); },
    onError: () => toast.error("Failed to delete image"),
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (imgId: number) => adminFetch(`/admin/images/${imgId}`, { method: "PATCH", body: JSON.stringify({ is_primary: true }) }),
    onSuccess: () => { invalidate(); toast.success("Primary image set"); },
    onError: () => toast.error("Failed to set primary image"),
  });

  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    updateMutation.mutate({
      name: form.get("name"),
      slug: form.get("slug") || "",
      description,
      categories: selectedCategories,
      is_active: form.get("is_active") === "on",
      is_featured: form.get("is_featured") === "on",
    });
  }

  function handleAddVariant(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    addVariantMutation.mutate({ name: form.get("variant_name"), price: form.get("variant_price"), stock: Number(form.get("variant_stock")) });
    e.currentTarget.reset();
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("alt_text", product?.name || "");
    formData.append("is_primary", product?.images.length === 0 ? "true" : "false");
    formData.append("order", String(product?.images.length || 0));
    uploadImageMutation.mutate(formData);
    e.target.value = "";
  }

  const allCats: { id: number; name: string; depth: number }[] = [];
  for (const cat of categories ?? []) {
    allCats.push({ id: cat.id, name: cat.name, depth: 0 });
    for (const child of cat.children ?? []) allCats.push({ id: child.id, name: child.name, depth: 1 });
  }

  if (isLoading || !product) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5A1F1F]/20 border-t-[#5A1F1F]" /></div>;
  }

  return (
    <div>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5A1F1F]"><ArrowLeft size={14} /> Back to products</Link>
      <h1 className="text-2xl font-bold text-gray-900">Edit: {product.name}</h1>

      {/* Product info */}
      <form onSubmit={handleSave} className="mt-6 w-full space-y-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Name</label>
            <input id="name" name="name" defaultValue={product.name} required className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10" />
          </div>
          <div>
            <label htmlFor="slug" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Slug <span className="font-normal normal-case text-gray-300">(auto if empty)</span></label>
            <input id="slug" name="slug" defaultValue={product.slug} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Description</label>
          <RichTextEditor content={description} onChange={setDescription} placeholder="Product description..." />
        </div>

        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Categories</span>
          <div className="flex flex-wrap gap-2">
            {allCats.map((cat) => (
              <label key={cat.id} className={`inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${selectedCategories.includes(cat.id) ? "border-[#5A1F1F] bg-[#5A1F1F]/5 text-[#5A1F1F]" : "border-gray-200 text-gray-600 hover:bg-gray-50"} ${cat.depth > 0 ? "ml-4" : ""}`}>
                <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat.id)} onChange={() => setSelectedCategories((p) => p.includes(cat.id) ? p.filter((x) => x !== cat.id) : [...p, cat.id])} />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={product.is_active} className="rounded border-gray-300 text-[#5A1F1F]" /> Active</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" defaultChecked={product.is_featured} className="rounded border-gray-300 text-[#ECD691]" /> Featured</label>
        </div>

        <button type="submit" disabled={updateMutation.isPending} className="rounded-lg bg-[#5A1F1F] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4a1919] disabled:opacity-50">
          {updateMutation.isPending ? "Saving..." : "Save changes"}
        </button>
      </form>

      {/* Images */}
      <div className="mt-8 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Images</h2>
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadImageMutation.isPending} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <Upload size={13} /> {uploadImageMutation.isPending ? "Uploading..." : "Upload image"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {product.images.length === 0 ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 flex h-40 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-[#5A1F1F]/30 hover:text-[#5A1F1F]"
          >
            <div className="text-center">
              <ImagePlus size={32} className="mx-auto" />
              <p className="mt-2 text-sm">Click to upload first image</p>
            </div>
          </button>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {product.images.map((img) => (
              <div key={img.id} className={`group relative overflow-hidden rounded-xl border-2 ${img.is_primary ? "border-[#ECD691]" : "border-gray-100"}`}>
                <div className="aspect-square bg-gray-50">
                  {img.image ? (
                    <img src={img.image} alt={img.alt_text} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300"><ImagePlus size={24} /></div>
                  )}
                </div>
                {img.is_primary && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-[#ECD691] px-1.5 py-0.5 text-[9px] font-bold text-[#5A1F1F]">PRIMARY</span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/60 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  {!img.is_primary && (
                    <button type="button" onClick={() => setPrimaryMutation.mutate(img.id)} className="flex-1 rounded bg-white/20 px-1.5 py-1 text-[10px] font-semibold text-white hover:bg-white/30">
                      <StarIcon size={10} className="mr-0.5 inline" /> Set primary
                    </button>
                  )}
                  <button type="button" onClick={() => { if (confirm("Delete this image?")) deleteImageMutation.mutate(img.id); }} className="rounded bg-red-500/80 px-1.5 py-1 text-[10px] font-semibold text-white hover:bg-red-500">
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="mt-8 w-full">
        <h2 className="text-lg font-bold text-gray-900">Variants</h2>
        <div className="mt-4 space-y-2">
          {product.variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{v.name}</p>
                <p className="text-xs text-gray-400">SKU: {v.sku} · Stock: {v.stock}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-800">£{v.price}</span>
                <button type="button" onClick={() => { if (confirm("Delete this variant?")) deleteVariantMutation.mutate(v.id); }} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddVariant} className="mt-4 flex items-end gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4">
          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Name</label>
            <input name="variant_name" required placeholder="e.g. Large" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:outline-none" />
          </div>
          <div className="w-24">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Price</label>
            <input name="variant_price" type="number" step="0.01" required placeholder="0.00" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:outline-none" />
          </div>
          <div className="w-20">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Stock</label>
            <input name="variant_stock" type="number" defaultValue={999} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:outline-none" />
          </div>
          <button type="submit" disabled={addVariantMutation.isPending} className="inline-flex items-center gap-1 rounded-lg bg-[#5A1F1F] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4a1919] disabled:opacity-50">
            <Plus size={14} /> Add
          </button>
        </form>
      </div>
    </div>
  );
}
