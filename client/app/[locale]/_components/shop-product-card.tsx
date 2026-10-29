"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Star } from "lucide-react";
import { Link } from "@/i18n/navigation";

/** Strip markdown syntax for plain-text card preview. */
function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s+/g, "")      // headings
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/\*(.+?)\*/g, "$1")     // italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // links
    .replace(/[>\-*_`~]/g, "")       // misc syntax
    .replace(/\n+/g, " ")            // newlines
    .trim();
}
import type { ProductListItem } from "@/types/shop";

interface ShopProductCardProps {
  product: ProductListItem;
}

export function ShopProductCard({ product }: ShopProductCardProps) {
  const t = useTranslations("shop.listing");
  const hasPrice = product.min_price !== null;
  const samePrice = product.min_price === product.max_price;

  return (
    <Link
      href={`/shop/${product.slug}`}
      style={{ willChange: "transform" }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-maroon/8 bg-white/60 shadow-[0_2px_12px_-4px_rgba(90,31,31,0.06)] backdrop-blur-sm transition-[transform,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-brand-maroon/20"
    >
      {/* Hover shadow — animating opacity on a pre-painted shadow is
          compositor-only; animating box-shadow directly repaints every
          frame and janks the hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 shadow-[0_12px_40px_-12px_rgba(90,31,31,0.12)] transition-opacity duration-500 ease-out group-hover:opacity-100"
      />
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-cream/50">
        {product.primary_image?.image ? (
          <Image
            src={product.primary_image.image}
            alt={product.primary_image.alt_text || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-3xl text-brand-maroon/15">
              {product.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Featured badge */}
        {product.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-maroon">
            {t("featured")}
          </span>
        )}

        {/* Hover gradient overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Categories */}
        {product.categories.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {product.categories.map((cat) => (
              <span
                key={cat.id}
                className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-sage"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        <h3 className="font-display text-lg leading-snug text-brand-ink sm:text-xl">
          {product.name}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-brand-ink/55">
          {stripMarkdown(product.description)}
        </p>

        {/* Price + Rating row */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          {/* Price */}
          {hasPrice && (
            <div>
              {!samePrice && (
                <span className="block text-[10px] font-medium uppercase text-brand-ink/40">
                  {t("from")}
                </span>
              )}
              <span className="font-display text-xl text-brand-maroon">
                £{product.min_price}
              </span>
            </div>
          )}

          {/* Rating */}
          {product.average_rating !== null && (
            <div className="flex items-center gap-1 text-xs text-brand-ink/55">
              <Star size={13} fill="currentColor" className="text-brand-gold" />
              <span className="font-medium text-brand-ink">
                {Number(product.average_rating).toFixed(1)}
              </span>
              <span>({product.review_count})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
