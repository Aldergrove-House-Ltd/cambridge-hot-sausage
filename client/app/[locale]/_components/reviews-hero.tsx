"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Star } from "lucide-react";
import type { ReviewSummary } from "@/types/review";

interface ReviewsHeroProps {
  summary: ReviewSummary;
}

function StarRating({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, rating - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star
              className="absolute inset-0 text-brand-gold/25"
              size={size}
              strokeWidth={1.4}
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                className="text-brand-gold"
                size={size}
                strokeWidth={1.4}
                fill="currentColor"
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}

function GoogleMapsLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-maroon transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-100"
    >
      {label}
      <ArrowUpRight
        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        strokeWidth={2.2}
      />
    </a>
  );
}

export function ReviewsHero({ summary }: ReviewsHeroProps) {
  const t = useTranslations("reviews");
  const sectionRef = useRef<HTMLElement>(null);
  const ratingRef = useRef<HTMLSpanElement>(null);
  const rating = summary.available ? summary.averageRating : null;

  // Count the big rating up from 0.0
  useGSAP(
    () => {
      if (!ratingRef.current || rating === null) return;
      const counter = { value: 0 };
      gsap.to(counter, {
        value: rating,
        duration: 1.4,
        delay: 0.3,
        ease: "power2.out",
        onUpdate() {
          if (ratingRef.current) ratingRef.current.textContent = counter.value.toFixed(1);
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-brand-maroon pb-20 pt-32 text-brand-cream sm:pb-28 sm:pt-40"
    >
      {/* Decorative backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-gold/8 blur-[140px]" />
        <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-sage/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="text-center">
          <span
            data-reveal
            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold sm:text-xs"
          >
            {t("hero.eyebrow")}
          </span>
          <h1
            data-reveal
            style={{ animationDelay: "100ms" }}
            className="mt-3 font-display text-4xl leading-[1.1] sm:mt-4 sm:text-5xl lg:text-6xl"
          >
            {t("hero.title")}
          </h1>
          <p
            data-reveal
            style={{ animationDelay: "200ms" }}
            className="mx-auto mt-5 max-w-2xl text-balance text-base text-brand-cream/70 sm:mt-6 sm:text-lg"
          >
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Stats card */}
        <div
          data-reveal
          style={{ animationDelay: "350ms" }}
          className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-3xl border border-brand-gold/20 bg-brand-cream/[0.04] p-6 backdrop-blur-sm sm:mt-16 sm:p-8"
        >
          {rating !== null ? (
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-10">
              {/* Big rating */}
              <div className="flex flex-col items-center gap-2 sm:min-w-[140px]">
                <span
                  ref={ratingRef}
                  className="font-display text-6xl leading-none text-brand-gold sm:text-7xl"
                >
                  {rating.toFixed(1)}
                </span>
                <StarRating rating={rating} size={22} />
                <span className="mt-1 text-xs text-brand-cream/50">
                  {t("stats.outOf")}
                </span>
              </div>

              {/* Divider */}
              <div className="hidden h-24 w-px bg-brand-gold/15 sm:block" />
              <div className="h-px w-32 bg-brand-gold/15 sm:hidden" />

              {/* Count + link to every review on Google */}
              <div className="flex flex-1 flex-col items-center gap-4 text-center sm:items-start sm:text-left">
                <p className="text-lg text-brand-cream sm:text-xl">
                  {t("stats.basedOn", { count: summary.totalRatings ?? 0 })}
                </p>
                <GoogleMapsLink href={summary.googleMapsUrl} label={t("stats.seeAll")} />
                <p className="text-xs text-brand-cream/45">{t("stats.attribution")}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-lg text-brand-cream">{t("stats.unavailable")}</p>
              <GoogleMapsLink href={summary.googleMapsUrl} label={t("stats.seeAll")} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
