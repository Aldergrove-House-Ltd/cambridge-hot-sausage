"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check, Minus, Plus, Star, ShoppingCart } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// Allow GFM task-list checkboxes through the sanitizer. The default schema
// strips <input>, which turns "- [x] item" into just "item".
const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "input"],
  attributes: {
    ...defaultSchema.attributes,
    input: ["type", "checked", "disabled"],
  },
};
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/context";
import type { ProductDetail, ProductVariant } from "@/types/shop";
import { ShopReviewSection } from "./shop-review-section";

interface ShopProductDetailProps {
  product: ProductDetail;
}

export function ShopProductDetail({ product }: ShopProductDetailProps) {
  const t = useTranslations("shop");
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length > 0 ? product.variants[0] : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const currentImage = selectedImageId
    ? product.images.find((img) => img.id === selectedImageId) || product.images[0]
    : product.images.find((img) => img.is_primary) || product.images[0];

  return (
    <>
      <section className="relative bg-brand-cream pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="mx-auto max-w-6xl px-6">
          {/* Back link */}
          <Link
            href="/shop"
            data-reveal
            className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-brand-ink/50 transition-colors hover:text-brand-maroon"
          >
            <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
            {t("detail.backToShop")}
          </Link>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Image column */}
            <div>
              <div className="overflow-hidden rounded-3xl border border-brand-maroon/8 bg-white/60 shadow-[0_8px_30px_-10px_rgba(90,31,31,0.1)]">
                {/* Main image — click to open fullscreen */}
                <button
                  type="button"
                  onClick={() => currentImage?.image && setLightboxOpen(true)}
                  className="relative aspect-square w-full cursor-zoom-in bg-brand-cream/50"
                >
                  {currentImage?.image ? (
                    <Image
                      src={currentImage.image}
                      alt={currentImage.alt_text || product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-6xl text-brand-maroon/10">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </button>

                {/* Thumbnail strip — click to change */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto border-t border-brand-maroon/5 p-3">
                    {product.images.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setSelectedImageId(img.id)}
                        className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                          img.id === currentImage?.id
                            ? "border-brand-maroon"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        {img.image ? (
                          <Image
                            src={img.image}
                            alt={img.alt_text}
                            width={64}
                            height={64}
                            sizes="64px"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-brand-cream/50">
                            <span className="text-xs text-brand-maroon/20">
                              {product.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Info column */}
            <div>
              {/* Categories */}
              {product.categories.length > 0 && (
                <div data-reveal className="mb-3 flex flex-wrap gap-2">
                  {product.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-sage"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              <h1
                data-reveal
                style={{ animationDelay: "100ms" }}
                className="font-display text-3xl leading-tight text-brand-maroon sm:text-4xl lg:text-5xl"
              >
                {product.name}
              </h1>

              {/* Rating */}
              {product.average_rating !== null && (
                <div
                  data-reveal
                  style={{ animationDelay: "150ms" }}
                  className="mt-3 flex items-center gap-2"
                >
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={16}
                        strokeWidth={1.6}
                        className={
                          i < Math.round(product.average_rating!)
                            ? "text-brand-gold"
                            : "text-brand-ink/15"
                        }
                        fill={i < Math.round(product.average_rating!) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-brand-ink/55">
                    {Number(product.average_rating).toFixed(1)} ({product.review_count})
                  </span>
                </div>
              )}

              {/* Price */}
              {selectedVariant && (
                <div data-reveal style={{ animationDelay: "200ms" }} className="mt-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-3xl text-brand-maroon">
                      £{selectedVariant.price}
                    </span>
                    {selectedVariant.compare_at_price && (
                      <span className="text-lg text-brand-ink/35 line-through">
                        £{selectedVariant.compare_at_price}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-brand-sage">
                    {selectedVariant.in_stock
                      ? selectedVariant.stock < 10
                        ? t("detail.lowStock", { count: selectedVariant.stock })
                        : t("detail.inStock")
                      : t("detail.outOfStock")}
                  </p>
                </div>
              )}

              {/* Variant selector */}
              {product.variants.length > 1 && (
                <div data-reveal style={{ animationDelay: "250ms" }} className="mt-6">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                    {t("detail.selectVariant")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        disabled={!variant.in_stock}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                          selectedVariant?.id === variant.id
                            ? "border-brand-maroon bg-brand-maroon text-brand-cream shadow-[0_4px_20px_-6px_rgba(90,31,31,0.4)]"
                            : variant.in_stock
                              ? "border-brand-maroon/15 text-brand-ink hover:border-brand-maroon/40 hover:bg-brand-maroon/5"
                              : "border-brand-ink/10 text-brand-ink/25"
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to cart */}
              {/* Quantity input */}
              <div data-reveal style={{ animationDelay: "280ms" }} className="mt-6">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                  {t("detail.quantity")}
                </span>
                <div className="inline-flex items-center gap-1 rounded-full border border-brand-maroon/10 bg-white/70 px-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full text-brand-ink/50 transition-colors hover:bg-brand-maroon/10 hover:text-brand-maroon"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={selectedVariant?.stock ?? 999}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1) setQuantity(Math.min(val, selectedVariant?.stock ?? 999));
                    }}
                    className="w-12 bg-transparent text-center text-base font-semibold tabular-nums text-brand-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(q + 1, selectedVariant?.stock ?? 999))}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full text-brand-ink/50 transition-colors hover:bg-brand-maroon/10 hover:text-brand-maroon"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <div data-reveal style={{ animationDelay: "350ms" }} className="mt-4">
                <button
                  type="button"
                  disabled={!selectedVariant?.in_stock}
                  onClick={() => {
                    if (!selectedVariant) return;
                    const img = product.images.find((i) => i.is_primary) || product.images[0];
                    addItem({
                      variantId: selectedVariant.id,
                      productSlug: product.slug,
                      productName: product.name,
                      variantName: selectedVariant.name,
                      sku: selectedVariant.sku,
                      price: selectedVariant.price,
                      image: img?.image ?? null,
                    }, quantity);
                    setAdded(true);
                    setQuantity(1);
                    setTimeout(() => setAdded(false), 2000);
                  }}
                  className={`group inline-flex w-full items-center justify-center gap-3 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-wider shadow-[0_15px_35px_-12px_rgba(90,31,31,0.5)] transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_20px_45px_-12px_rgba(90,31,31,0.65)] active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-base ${
                    added
                      ? "bg-brand-sage text-brand-cream"
                      : "bg-brand-maroon text-brand-cream"
                  }`}
                >
                  {added ? (
                    <>
                      <Check size={18} strokeWidth={2.5} />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} strokeWidth={2} />
                      {selectedVariant?.in_stock
                        ? t("detail.addToCart")
                        : t("detail.outOfStock")}
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <div data-reveal style={{ animationDelay: "350ms" }} className="mt-10">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-ink/50">
                  {t("detail.description")}
                </h2>
                <div className="prose prose-sm mt-3 max-w-none text-brand-ink/70">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    rehypePlugins={[[rehypeSanitize, markdownSanitizeSchema]]}
                  >{product.description}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ShopReviewSection product={product} />

      {/* Fullscreen lightbox */}
      {lightboxOpen && currentImage?.image && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            ✕
          </button>

          {/* Prev / Next arrows */}
          {product.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const idx = product.images.findIndex((i) => i.id === currentImage.id);
                  const prev = product.images[(idx - 1 + product.images.length) % product.images.length];
                  setSelectedImageId(prev.id);
                }}
                className="absolute left-4 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const idx = product.images.findIndex((i) => i.id === currentImage.id);
                  const next = product.images[(idx + 1) % product.images.length];
                  setSelectedImageId(next.id);
                }}
                className="absolute right-4 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
              >
                ›
              </button>
            </>
          )}

          <Image
            src={currentImage.image}
            alt={currentImage.alt_text || product.name}
            width={1600}
            height={1600}
            sizes="90vw"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-auto max-w-[90vw] rounded-lg object-contain"
          />

          {/* Thumbnail dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedImageId(img.id); }}
                  className={`h-2 w-2 rounded-full transition-all ${
                    img.id === currentImage.id ? "w-6 bg-white" : "bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
