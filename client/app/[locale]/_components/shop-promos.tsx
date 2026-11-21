"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Flame, Gift, ShoppingBag } from "lucide-react";

export type PromoKey = "giftCards" | "sauces" | "merchandise";

// Category slugs each block filters the product grid to. They match once the
// categories exist in the admin (a "Gift cards" category gets the slug
// "gift-cards"); "merch" covers the category the seed data already uses.
export const PROMO_CATEGORY_SLUGS: Record<PromoKey, readonly string[]> = {
  giftCards: ["gift-cards"],
  sauces: ["sauces"],
  merchandise: ["merchandise", "merch"],
};

const GIFT_OPTIONS = ["five", "ten"] as const;

const SECONDARY_PROMOS: { key: Exclude<PromoKey, "giftCards">; icon: React.ReactNode }[] = [
  { key: "sauces", icon: <Flame className="h-6 w-6" strokeWidth={1.6} /> },
  { key: "merchandise", icon: <ShoppingBag className="h-6 w-6" strokeWidth={1.6} /> },
];

export function ShopPromos({ onShop }: { onShop: (key: PromoKey) => void }) {
  const t = useTranslations("shop.listing.promos");

  return (
    <div className="mt-12 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:gap-6">
      {/* Gift cards — the lead offer, so it gets the dark card */}
      <article
        data-reveal
        style={{ animationDelay: "250ms" }}
        className="relative flex flex-col overflow-hidden rounded-3xl bg-brand-maroon p-6 text-brand-cream shadow-[0_24px_60px_-24px_rgba(90,31,31,0.55)] sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-gold/15 blur-[60px]"
        />
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30">
          <Gift className="h-6 w-6" strokeWidth={1.6} />
        </div>
        <h2 className="mt-5 font-display text-2xl leading-snug sm:text-3xl">
          {t("giftCards.title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-cream/70 sm:text-base">
          {t("giftCards.body")}
        </p>
        <ul className="mt-5 space-y-3">
          {GIFT_OPTIONS.map((option) => (
            <li
              key={option}
              className="rounded-2xl border border-brand-gold/25 bg-brand-cream/[0.04] px-4 py-3"
            >
              <p className="font-semibold text-brand-gold">
                {t(`giftCards.options.${option}.label`)}
              </p>
              <p className="mt-0.5 text-sm text-brand-cream/65">
                {t(`giftCards.options.${option}.note`)}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={() => onShop("giftCards")}
            className="group inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-maroon transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-100"
          >
            {t("giftCards.cta")}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={2.2}
            />
          </button>
        </div>
      </article>

      {SECONDARY_PROMOS.map(({ key, icon }, i) => (
        <article
          key={key}
          data-reveal
          style={{ animationDelay: `${330 + i * 80}ms` }}
          className="flex flex-col rounded-3xl border border-brand-maroon/10 bg-white/60 p-6 shadow-[0_2px_12px_-4px_rgba(90,31,31,0.06)] backdrop-blur-sm sm:p-8"
        >
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-maroon/10 text-brand-maroon ring-1 ring-brand-maroon/15">
            {icon}
          </div>
          <h2 className="mt-5 font-display text-2xl leading-snug text-brand-maroon sm:text-3xl">
            {t(`${key}.title`)}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-ink/65 sm:text-base">
            {t(`${key}.body`)}
          </p>
          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={() => onShop(key)}
              className="group inline-flex items-center gap-2 rounded-full border border-brand-maroon/20 px-6 py-3 text-sm font-semibold text-brand-maroon transition-colors duration-300 ease-out hover:border-brand-maroon/40 hover:bg-brand-maroon/5"
            >
              {t(`${key}.cta`)}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={2.2}
              />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
