"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ArrowUpRight, Star, Quote } from "lucide-react";
import type { Review, ReviewSummary } from "@/types/review";

/* ─── Helpers ────────────────────────────────────────────────── */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function initialsColor(name: string): string {
  const palette = [
    "bg-brand-maroon text-brand-cream",
    "bg-brand-sage text-brand-cream",
    "bg-brand-gold text-brand-maroon",
    "bg-brand-ink text-brand-cream",
    "bg-brand-maroon/80 text-brand-gold",
    "bg-brand-sage/80 text-brand-cream",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

/* ─── Star rating (small inline) ─────────────────────────────── */

function StarRatingSmall({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-px" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          strokeWidth={1.6}
          className={i < rating ? "text-brand-gold" : "text-brand-ink/15"}
          fill={i < rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

/* ─── Filter pill ────────────────────────────────────────────── */

interface FilterPillProps {
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
}

function FilterPill({ label, active, count, onClick }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ease-out
        ${
          active
            ? "border-brand-maroon bg-brand-maroon text-brand-cream shadow-[0_4px_20px_-6px_rgba(90,31,31,0.4)]"
            : "border-brand-maroon/15 bg-transparent text-brand-ink hover:border-brand-maroon/40 hover:bg-brand-maroon/5"
        }
      `}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums ${
            active
              ? "bg-brand-cream/20 text-brand-cream"
              : "bg-brand-maroon/10 text-brand-maroon/70"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── Single review card ─────────────────────────────────────── */

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("reviews.feed");
  const shouldTruncate = review.text.length > 180;
  const authorName = review.author_url ? (
    <a
      href={review.author_url}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-colors hover:text-brand-maroon"
    >
      {review.author_name}
    </a>
  ) : (
    review.author_name
  );

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-maroon/8 bg-white/60 p-5 shadow-[0_2px_12px_-4px_rgba(90,31,31,0.06)] backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-brand-maroon/20 hover:shadow-[0_12px_40px_-12px_rgba(90,31,31,0.12)] sm:p-6">
      {/* Hover gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-gold/0 via-brand-gold/0 to-brand-gold/[0.04] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Quote icon */}
      <Quote
        aria-hidden
        size={32}
        strokeWidth={1}
        className="absolute right-4 top-4 text-brand-maroon/[0.06] transition-all duration-500 group-hover:text-brand-gold/20"
      />

      {/* Author row */}
      <div className="flex items-center gap-3">
        {review.profile_photo_url ? (
          // Plain <img>: Google's photo URLs are loaded straight from Google
          // (not re-hosted by Next's optimiser), and need no-referrer.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.profile_photo_url}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${initialsColor(review.author_name)}`}
          >
            {getInitials(review.author_name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-ink">{authorName}</p>
          <p className="text-xs text-brand-ink/45">
            {review.relative_time_description}
          </p>
        </div>
      </div>

      {/* Stars + source */}
      <div className="mt-3 flex items-center gap-2">
        <StarRatingSmall rating={review.rating} />
        <span className="text-[10px] font-medium text-brand-sage">{t("googleReview")}</span>
      </div>

      {/* Review text */}
      <div className="mt-3 flex-1">
        <p className="text-sm leading-relaxed text-brand-ink/75">
          {shouldTruncate && !expanded
            ? review.text.slice(0, 180) + "..."
            : review.text}
        </p>
        {shouldTruncate && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 text-xs font-semibold text-brand-maroon transition-colors hover:text-brand-maroon/70"
          >
            {expanded ? t("readLess") : t("readMore")}
          </button>
        )}
      </div>

      {review.review_url && (
        <a
          href={review.review_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 self-start text-xs font-medium text-brand-ink/45 transition-colors hover:text-brand-maroon"
        >
          {t("viewOnGoogle")}
          <ArrowUpRight size={12} strokeWidth={2} />
        </a>
      )}
    </article>
  );
}

/* ─── CTA Section ────────────────────────────────────────────── */

function ReviewsCta({ writeReviewUrl }: { writeReviewUrl: string }) {
  const t = useTranslations("reviews.cta");

  return (
    <section className="relative overflow-hidden bg-brand-cream py-20 text-brand-ink sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-brand-gold/10 blur-[100px]" />
        <div className="absolute -left-32 bottom-0 h-[300px] w-[300px] rounded-full bg-brand-sage/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <h2
          data-reveal
          className="font-display text-3xl leading-tight text-brand-maroon sm:text-4xl lg:text-5xl"
        >
          {t("title")}
        </h2>
        <p
          data-reveal
          style={{ animationDelay: "100ms" }}
          className="mx-auto mt-4 max-w-lg text-balance text-base text-brand-ink/60 sm:text-lg"
        >
          {t("subtitle")}
        </p>
        <div data-reveal style={{ animationDelay: "200ms" }} className="mt-8">
          <a
            href={writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-full bg-brand-maroon px-8 py-4 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_20px_45px_-15px_rgba(90,31,31,0.35)] transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-[0_30px_55px_-15px_rgba(90,31,31,0.5)] active:scale-100 sm:text-base"
          >
            <span>{t("button")}</span>
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold text-brand-maroon transition-transform duration-300 group-hover:translate-x-1 group-hover:-rotate-12"
            >
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.6} />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Main feed ──────────────────────────────────────────────── */

interface ReviewsFeedProps {
  reviews: Review[];
  summary: ReviewSummary;
}

export function ReviewsFeed({ reviews, summary }: ReviewsFeedProps) {
  const t = useTranslations("reviews");
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (activeFilter === null) return reviews;
    return reviews.filter((r) => r.rating === activeFilter);
  }, [reviews, activeFilter]);

  // Reviews are already 4★/5★ only; offer a pill per rating that's present.
  const starFilters = useMemo(
    () =>
      [5, 4]
        .map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }))
        .filter(({ count }) => count > 0),
    [reviews],
  );

  // Stagger cards on initial mount
  useGSAP(
    () => {
      if (!gridRef.current) return;
      const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-review-card]");
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.15,
        },
      );
    },
    { scope: sectionRef },
  );

  // Animate cards on filter change
  const animateFilterChange = useCallback(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-review-card]");
    gsap.fromTo(
      cards,
      { y: 24, opacity: 0, scale: 0.97 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.05,
      },
    );
  }, []);

  const handleFilter = useCallback(
    (star: number | null) => {
      setActiveFilter(star);
      // Wait one frame for React to re-render, then animate
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          animateFilterChange();
        });
      });
    },
    [animateFilterChange],
  );

  return (
    <>
      <section ref={sectionRef} className="relative bg-brand-cream py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          {/* Section header */}
          <div className="text-center">
            <span
              data-reveal
              className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-sage sm:text-xs"
            >
              {t("feed.eyebrow")}
            </span>
            <h2
              data-reveal
              style={{ animationDelay: "100ms" }}
              className="mt-3 font-display text-3xl text-brand-ink sm:text-4xl lg:text-5xl"
            >
              {t("feed.title")}
            </h2>
          </div>

          {/* Filter pills — only when there's more than one rating to pick */}
          {starFilters.length > 1 && (
            <div
              data-reveal
              style={{ animationDelay: "200ms" }}
              className="mt-10 flex flex-wrap justify-center gap-2 sm:mt-12"
            >
              <FilterPill
                label={t("feed.filterAll")}
                active={activeFilter === null}
                count={reviews.length}
                onClick={() => handleFilter(null)}
              />
              {starFilters.map(({ star, count }) => (
                <FilterPill
                  key={star}
                  label={t("feed.filterStar", { count: star })}
                  active={activeFilter === star}
                  count={count}
                  onClick={() => handleFilter(star)}
                />
              ))}
            </div>
          )}

          {/* Review grid */}
          {reviews.length > 0 ? (
            <>
              <div
                ref={gridRef}
                className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((review) => (
                  <div key={review.review_url || `${review.author_name}-${review.time}`} data-review-card>
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
              <p className="mt-10 text-center text-sm text-brand-ink/50">
                {t("feed.note")}{" "}
                <a
                  href={summary.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-maroon underline-offset-4 hover:underline"
                >
                  {t("feed.readAll")}
                </a>
              </p>
            </>
          ) : (
            <div className="mt-10 py-16 text-center sm:mt-12">
              <p className="text-lg text-brand-ink/50">
                {summary.available ? t("feed.empty") : t("feed.unavailable")}
              </p>
              <a
                href={summary.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-maroon underline-offset-4 hover:underline"
              >
                {t("feed.readAll")}
                <ArrowUpRight size={14} strokeWidth={2} />
              </a>
            </div>
          )}
        </div>
      </section>

      <ReviewsCta writeReviewUrl={summary.writeReviewUrl} />
    </>
  );
}
