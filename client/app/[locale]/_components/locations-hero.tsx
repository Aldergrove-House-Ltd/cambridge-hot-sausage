"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { MapPin, Clock, Landmark, Navigation, Footprints, Bike, Car } from "lucide-react";

const LocateUsMap = dynamic(() => import("./locate-us-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-cream/60 text-sm text-brand-ink/50">
      Loading map…
    </div>
  ),
});

const KIOSK_KEYS = ["main", "secondary"] as const;
type KioskKey = (typeof KIOSK_KEYS)[number];

const KIOSKS: Record<
  KioskKey,
  { lat: number; lng: number; nearby: readonly string[] }
> = {
  main: {
    lat: 52.206680540625506,
    lng: 0.1298263621124822,
    nearby: ["grafton", "christs", "busStation", "station"],
  },
  secondary: {
    lat: 52.206090944020346,
    lng: 0.12063357052785396,
    nearby: ["arcade", "market", "kings", "station"],
  },
};

const MODES = [
  { key: "walking", icon: Footprints },
  { key: "cycling", icon: Bike },
  { key: "driving", icon: Car },
] as const;

function directionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function LocationsHero() {
  const t = useTranslations("locations");
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeKiosk, setActiveKiosk] = useState<KioskKey>("main");

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!el.clientWidth) return;
        const idx = Math.round(el.scrollLeft / el.clientWidth);
        const next = KIOSK_KEYS[idx];
        if (next) setActiveKiosk((prev) => (prev === next ? prev : next));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  const selectKiosk = useCallback((key: KioskKey) => {
    const el = carouselRef.current;
    if (!el) return;
    const idx = KIOSK_KEYS.indexOf(key);
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }, []);

  return (
    <>
      {/* ─── Hero: Map + Header ─────────────────────────────────── */}
      <section className="relative bg-brand-maroon pt-28 pb-24 text-brand-cream sm:pt-36 sm:pb-32">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-gold/8 blur-[140px]" />
          <div className="absolute -right-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-brand-sage/10 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[48px_48px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
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
              className="mx-auto mt-5 max-w-xl text-balance text-base text-brand-cream/70 sm:mt-6 sm:text-lg"
            >
              {t("hero.subtitle")}
            </p>
          </div>

          <div
            data-reveal="scale"
            style={{ animationDelay: "350ms" }}
            className="mx-auto mt-12 max-w-5xl sm:mt-16"
          >
            <div className="overflow-hidden rounded-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] ring-1 ring-white/10">
              <div className="h-[340px] sm:h-[440px] lg:h-[500px]">
                <LocateUsMap
                  pins={[
                    { lat: KIOSKS.main.lat, lng: KIOSKS.main.lng, name: t("info.main.name"), address: t("info.main.line") },
                    { lat: KIOSKS.secondary.lat, lng: KIOSKS.secondary.lng, name: t("info.secondary.name"), address: t("info.secondary.line") },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Highlight stats ───────────────────────────────────── */}
      <section className="relative bg-brand-cream py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-brand-gold/10 blur-[100px]" />
          <div className="absolute -left-32 bottom-0 h-[300px] w-[300px] rounded-full bg-brand-sage/8 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h2
            data-reveal
            className="font-display text-3xl leading-tight text-brand-maroon sm:text-4xl lg:text-5xl"
          >
            {t("highlight.title")}
          </h2>
          <p
            data-reveal
            style={{ animationDelay: "100ms" }}
            className="mx-auto mt-4 max-w-xl text-balance text-base text-brand-ink/60 sm:text-lg"
          >
            {t("highlight.subtitle")}
          </p>

          <div
            data-reveal
            style={{ animationDelay: "200ms" }}
            className="mx-auto mt-12 flex max-w-2xl items-center justify-center gap-8 sm:mt-16 sm:gap-16"
          >
            {(["years", "dogs", "days"] as const).map((key) => (
              <div key={key} className="text-center">
                <span className="font-display text-4xl text-brand-maroon sm:text-5xl lg:text-6xl">
                  {t(`highlight.stats.${key}.value`)}
                </span>
                <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-ink/50 sm:text-xs">
                  {t(`highlight.stats.${key}.label`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Info cards (Main + Secondary + Hours) ─────────────── */}
      <section className="relative overflow-hidden bg-brand-maroon py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-brand-gold/8 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[48px_48px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <InfoCard
              icon={<MapPin className="h-6 w-6" strokeWidth={1.6} />}
              label={t("info.main.label")}
              title={t("info.main.name")}
              description={t("info.main.description")}
              body={t("info.main.line")}
              directionsHref={directionsUrl(KIOSKS.main.lat, KIOSKS.main.lng)}
              directionsLabel={t("info.main.directions")}
              badge="Main"
              featured
              delay={100}
            />
            <InfoCard
              icon={<MapPin className="h-6 w-6" strokeWidth={1.6} />}
              label={t("info.secondary.label")}
              title={t("info.secondary.name")}
              description={t("info.secondary.description")}
              body={t("info.secondary.line")}
              directionsHref={directionsUrl(KIOSKS.secondary.lat, KIOSKS.secondary.lng)}
              directionsLabel={t("info.secondary.directions")}
              delay={150}
            />
            <div data-reveal style={{ animationDelay: "200ms" }} className="sm:col-span-2 lg:col-span-1">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-brand-gold/25 bg-brand-cream/[0.04] p-6 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-[0_12px_40px_-12px_rgba(236,214,145,0.2)] sm:p-7">
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-gold/0 via-brand-gold/0 to-brand-gold/[0.06] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30">
                  <Clock className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <span className="mt-5 block text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gold">
                  {t("info.hours.label")}
                </span>
                <h3 className="mt-2 font-display text-xl text-brand-cream">
                  {t("info.hours.title")}
                </h3>
                <dl className="mt-4 space-y-1.5 text-sm">
                  {(["weekdays", "saturday", "sunday"] as const).map((day) => (
                    <div key={day} className="flex items-center justify-between gap-4">
                      <dt className="text-brand-cream/60">{t(`info.hours.${day}`)}</dt>
                      <dd className="font-medium tabular-nums text-brand-cream">
                        {t(`info.hours.${day}Times`)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Per-kiosk directions carousel ─────────────────────── */}
      <section className="relative overflow-hidden bg-brand-cream py-20 text-brand-ink sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-brand-gold/10 blur-[100px]" />
          <div className="absolute -left-32 bottom-0 h-[300px] w-[300px] rounded-full bg-brand-sage/8 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center">
            <span
              data-reveal
              className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-sage sm:text-xs"
            >
              {t("directions.eyebrow")}
            </span>
            <h2
              data-reveal
              style={{ animationDelay: "100ms" }}
              className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl lg:text-5xl"
            >
              {t("directions.title")}
            </h2>
            <p
              data-reveal
              style={{ animationDelay: "200ms" }}
              className="mx-auto mt-4 max-w-xl text-balance text-base text-brand-ink/60 sm:text-lg"
            >
              {t("directions.subtitle")}
            </p>
          </div>

          {/* Tabs */}
          <div
            data-reveal
            style={{ animationDelay: "300ms" }}
            className="mt-10 flex items-center justify-center gap-2 sm:mt-12 sm:gap-3"
            role="tablist"
            aria-label={t("directions.title")}
          >
            {KIOSK_KEYS.map((key) => {
              const isActive = activeKiosk === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`kiosk-panel-${key}`}
                  onClick={() => selectKiosk(key)}
                  className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300 ease-out sm:text-sm ${
                    isActive
                      ? "bg-brand-maroon text-brand-cream shadow-[0_8px_24px_-8px_rgba(90,31,31,0.35)]"
                      : "bg-white/60 text-brand-maroon/70 ring-1 ring-brand-maroon/15 hover:bg-white hover:text-brand-maroon"
                  }`}
                >
                  {t(`directions.kiosks.${key}.tabLabel`)}
                </button>
              );
            })}
          </div>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="mt-8 flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2 sm:mt-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-live="polite"
          >
            {KIOSK_KEYS.map((key) => {
              const kiosk = KIOSKS[key];
              return (
                <div
                  key={key}
                  id={`kiosk-panel-${key}`}
                  role="tabpanel"
                  aria-hidden={activeKiosk !== key}
                  className="w-full flex-shrink-0 snap-center snap-always px-1"
                >
                  {/* Three modes */}
                  <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
                    {MODES.map(({ key: mode, icon: Icon }, i) => (
                      <div key={mode} data-reveal style={{ animationDelay: `${100 + i * 80}ms` }}>
                        <div className="group relative h-full overflow-hidden rounded-2xl border border-brand-maroon/8 bg-white/60 p-6 shadow-[0_2px_12px_-4px_rgba(90,31,31,0.06)] backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-brand-maroon/20 hover:shadow-[0_12px_40px_-12px_rgba(90,31,31,0.12)] sm:p-7">
                          <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-gold/0 via-brand-gold/0 to-brand-gold/[0.04] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          />
                          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-maroon/8 text-brand-maroon ring-1 ring-brand-maroon/10 transition-all duration-500 group-hover:bg-brand-maroon/12 group-hover:ring-brand-maroon/25">
                            <Icon className="h-5 w-5" strokeWidth={1.8} />
                          </div>
                          <h3 className="mt-4 font-display text-xl leading-snug text-brand-maroon sm:text-2xl">
                            {t(`directions.kiosks.${key}.${mode}.title`)}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-brand-ink/60">
                            {t(`directions.kiosks.${key}.${mode}.description`)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Nearby landmarks */}
                  <div data-reveal style={{ animationDelay: "400ms" }} className="mt-5">
                    <div className="group relative overflow-hidden rounded-2xl border border-brand-maroon/8 bg-white/60 p-6 shadow-[0_2px_12px_-4px_rgba(90,31,31,0.06)] backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-500 ease-out hover:border-brand-maroon/20 hover:shadow-[0_12px_40px_-12px_rgba(90,31,31,0.12)] sm:p-7">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-maroon/8 text-brand-maroon ring-1 ring-brand-maroon/10">
                          <Landmark className="h-5 w-5" strokeWidth={1.8} />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-maroon/70">
                          {t(`directions.kiosks.${key}.nearby.label`)}
                        </span>
                      </div>
                      <ul className="mt-5 grid gap-2.5 text-sm sm:grid-cols-2">
                        {kiosk.nearby.map((item) => (
                          <li key={item} className="flex items-center gap-2.5 text-brand-ink/70">
                            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-gold" />
                            {t(`directions.kiosks.${key}.nearby.items.${item}`)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-8 text-center sm:mt-10">
                    <a
                      href={directionsUrl(kiosk.lat, kiosk.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={activeKiosk === key ? 0 : -1}
                      className="group inline-flex items-center gap-3 rounded-full bg-brand-maroon px-8 py-4 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_20px_45px_-15px_rgba(90,31,31,0.35)] transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-[0_30px_55px_-15px_rgba(90,31,31,0.5)] active:scale-100 sm:text-base"
                    >
                      <Navigation
                        className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12"
                        strokeWidth={2.2}
                      />
                      <span>{t("directions.ctaLabel")}</span>
                    </a>
                    <p className="mt-3 text-xs text-brand-ink/40">
                      {t("directions.ctaHint")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs text-brand-ink/40 sm:hidden">
            {t("directions.swipeHint")}
          </p>
        </div>
      </section>
    </>
  );
}

function InfoCard({
  icon,
  label,
  title,
  description,
  body,
  directionsHref,
  directionsLabel,
  badge,
  featured = false,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  body: string;
  directionsHref: string;
  directionsLabel: string;
  badge?: string;
  /** The main location's card: stronger border, gold tint, filled button. */
  featured?: boolean;
  delay: number;
}) {
  return (
    <div data-reveal style={{ animationDelay: `${delay}ms` }}>
      <div
        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 sm:p-7 ${
          featured
            ? "border-brand-gold/60 bg-brand-gold/[0.08] shadow-[0_18px_50px_-18px_rgba(236,214,145,0.35)] hover:border-brand-gold/80"
            : "border-brand-gold/25 bg-brand-cream/[0.04] hover:border-brand-gold/50 hover:shadow-[0_12px_40px_-12px_rgba(236,214,145,0.2)]"
        }`}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-gold/0 via-brand-gold/0 to-brand-gold/[0.06] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30">
            {icon}
          </div>
          {badge && (
            <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-gold">
              {badge}
            </span>
          )}
        </div>
        <span className="mt-5 block text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gold">
          {label}
        </span>
        <h3 className="mt-2 font-display text-xl text-brand-cream">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-brand-cream/75">{description}</p>
        <address className="mt-3 text-sm not-italic leading-relaxed text-brand-cream/55">
          {body}
        </address>
        <div className="mt-auto pt-6">
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex w-full items-center justify-center gap-2 text-balance rounded-full px-5 py-3 text-center text-sm font-semibold leading-snug transition-all duration-300 ease-out ${
              featured
                ? "bg-brand-gold text-brand-maroon hover:scale-[1.02] active:scale-100"
                : "text-brand-gold ring-1 ring-brand-gold/40 hover:bg-brand-gold/10 hover:ring-brand-gold/70"
            }`}
          >
            <Navigation className="h-4 w-4 flex-shrink-0" strokeWidth={2.2} />
            <span>{directionsLabel}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
