"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useFilteredProducts } from "@/lib/shop/hooks";
import type { Category, PaginatedResponse, ProductListItem } from "@/types/shop";
import { ShopProductCard } from "./shop-product-card";
import { PROMO_CATEGORY_SLUGS, ShopPromos, type PromoKey } from "./shop-promos";

interface ShopListingProps {
  initialCategories: Category[];
  initialProducts: PaginatedResponse<ProductListItem>;
}

export function ShopListing({ initialCategories, initialProducts }: ShopListingProps) {
  const t = useTranslations("shop.listing");
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const filtersRef = useRef<HTMLDivElement>(null);

  function handleSearch(value: string) {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }

  // The active parent category object (for showing children)
  const selectedParent = useMemo(
    () => initialCategories.find((c) => c.slug === activeParent) ?? null,
    [initialCategories, activeParent],
  );

  // The active filter slug — child takes priority over parent
  const activeCategory = activeChild ?? activeParent;

  // Build query params
  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (activeCategory) p.category = activeCategory;
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    return p;
  }, [activeCategory, debouncedSearch]);

  const isDefault = Object.keys(params).length === 0;
  const { data, isFetching } = useFilteredProducts(
    params,
    isDefault ? initialProducts : undefined,
  );

  const products = data ?? initialProducts;

  // ── Handlers ─────────────────────────────────────────────────

  function handleParentClick(slug: string | null) {
    if (slug === activeParent) {
      // Deselect → back to all
      setActiveParent(null);
      setActiveChild(null);
    } else {
      setActiveParent(slug);
      setActiveChild(null); // Reset child when switching parent
    }
  }

  // Promo buttons select their category when it exists, then bring the
  // filters + grid into view.
  function handlePromoShop(key: PromoKey) {
    const match = initialCategories.find((c) => PROMO_CATEGORY_SLUGS[key].includes(c.slug));
    if (match) {
      setActiveParent(match.slug);
      setActiveChild(null);
    }
    filtersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleChildClick(slug: string) {
    if (slug === activeChild) {
      // Deselect child → show parent category
      setActiveChild(null);
    } else {
      setActiveChild(slug);
    }
  }

  return (
    <section className="relative bg-brand-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center">
          <span
            data-reveal
            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-sage sm:text-xs"
          >
            {t("eyebrow")}
          </span>
          <h1
            data-reveal
            style={{ animationDelay: "100ms" }}
            className="mx-auto mt-3 max-w-4xl text-balance font-display text-4xl text-brand-maroon sm:text-5xl lg:text-6xl"
          >
            {t("title")}
          </h1>
          <div
            data-reveal
            style={{ animationDelay: "200ms" }}
            className="mx-auto mt-4 max-w-xl space-y-3 text-balance text-base text-brand-ink/60 sm:text-lg"
          >
            {t("subtitle")
              .split("\n\n")
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
          </div>
        </div>

        <ShopPromos onShop={handlePromoShop} />

        {/* Search bar — the scroll target is the un-animated wrapper, so the
            reveal transform on the inner box can't skew the scroll position */}
        <div ref={filtersRef} className="mt-12 scroll-mt-28 sm:mt-16">
          <div
            data-reveal
            style={{ animationDelay: "300ms" }}
            className="mx-auto max-w-md"
          >
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/35"
                strokeWidth={2}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={t("search")}
                className="w-full rounded-full border border-brand-maroon/10 bg-white/70 py-3 pl-11 pr-4 text-sm text-brand-ink placeholder:text-brand-ink/35 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
              />
            </div>
          </div>
        </div>

        {/* ── Parent categories ──────────────────────────────────── */}
        <div
          data-reveal
          style={{ animationDelay: "400ms" }}
          className="mt-8 flex flex-wrap justify-center gap-2"
        >
          <button
            type="button"
            onClick={() => handleParentClick(null)}
            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ease-out ${
              activeParent === null
                ? "border-brand-maroon bg-brand-maroon text-brand-cream shadow-[0_4px_20px_-6px_rgba(90,31,31,0.4)]"
                : "border-brand-maroon/15 bg-transparent text-brand-ink hover:border-brand-maroon/40 hover:bg-brand-maroon/5"
            }`}
          >
            {t("filterAll")}
          </button>
          {initialCategories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => handleParentClick(cat.slug)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ease-out ${
                activeParent === cat.slug
                  ? "border-brand-maroon bg-brand-maroon text-brand-cream shadow-[0_4px_20px_-6px_rgba(90,31,31,0.4)]"
                  : "border-brand-maroon/15 bg-transparent text-brand-ink hover:border-brand-maroon/40 hover:bg-brand-maroon/5"
              }`}
            >
              {cat.name}
              {cat.children.length > 0 && (
                <span
                  className={`text-[10px] ${
                    activeParent === cat.slug ? "text-brand-cream/60" : "text-brand-ink/30"
                  }`}
                >
                  ({cat.children.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Child categories (appear when parent is selected) ── */}
        {selectedParent && selectedParent.children.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveChild(null)}
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 ease-out ${
                activeChild === null
                  ? "border-brand-gold bg-brand-gold text-brand-maroon shadow-[0_4px_16px_-6px_rgba(236,214,145,0.5)]"
                  : "border-brand-gold/30 bg-transparent text-brand-ink/60 hover:border-brand-gold/60 hover:bg-brand-gold/10"
              }`}
            >
              All {selectedParent.name}
            </button>
            {selectedParent.children.map((child) => (
              <button
                key={child.slug}
                type="button"
                onClick={() => handleChildClick(child.slug)}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 ease-out ${
                  activeChild === child.slug
                    ? "border-brand-gold bg-brand-gold text-brand-maroon shadow-[0_4px_16px_-6px_rgba(236,214,145,0.5)]"
                    : "border-brand-gold/30 bg-transparent text-brand-ink/60 hover:border-brand-gold/60 hover:bg-brand-gold/10"
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}

        {/* Product grid */}
        <div className="mt-10 sm:mt-14">
          {isFetching && !data ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-maroon/20 border-t-brand-maroon" />
            </div>
          ) : products.results.length > 0 ? (
            <div className="relative">
              {isFetching && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-maroon/20 border-t-brand-maroon" />
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.results.map((product) => (
                  <div key={product.id} data-reveal>
                    <ShopProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg text-brand-ink/40">{t("noResults")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
