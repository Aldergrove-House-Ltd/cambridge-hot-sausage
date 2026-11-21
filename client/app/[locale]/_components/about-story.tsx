"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Award, Heart, Flame } from "lucide-react";
import josephImg from "@/img/about/joseph.webp";

gsap.registerPlugin(ScrollTrigger);

type MilestoneKey = "founded" | "cambridgeLife" | "parties" | "anniversary" | "today";
type ValueKey = "quality" | "tradition" | "community";

const MILESTONE_KEYS: MilestoneKey[] = [
  "founded",
  "cambridgeLife",
  "parties",
  "anniversary",
  "today",
];

const VALUE_ICONS: Record<ValueKey, React.ReactNode> = {
  quality: <Award className="h-7 w-7" strokeWidth={1.6} />,
  tradition: <Flame className="h-7 w-7" strokeWidth={1.6} />,
  community: <Heart className="h-7 w-7" strokeWidth={1.6} />,
};

const VALUE_KEYS: ValueKey[] = ["quality", "tradition", "community"];

export function AboutStory() {
  const t = useTranslations("about");
  const timelineRef = useRef<HTMLDivElement>(null);
  const josephRef = useRef<HTMLDivElement>(null);

  // Parallax on second Joseph image
  useGSAP(() => {
    if (!josephRef.current) return;

    gsap.to(josephRef.current, {
      yPercent: -12,
      ease: "none",
      scrollTrigger: {
        trigger: josephRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  // Animate timeline line drawing
  useGSAP(() => {
    if (!timelineRef.current) return;

    const line = timelineRef.current.querySelector<HTMLElement>("[data-timeline-line]");
    if (!line) return;

    gsap.fromTo(
      line,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top 70%",
          end: "bottom 60%",
          scrub: true,
        },
      },
    );
  });

  return (
    <>
      {/* ─── Story + Joseph ─────────────────────────────────────── */}
      <section className="relative bg-brand-cream py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
            {/* Joseph image (knife sharpening) */}
            <div
              ref={josephRef}
              className="relative w-[260px] flex-shrink-0 sm:w-[320px] lg:w-[380px]"
            >
              {/* Decorative ring behind */}
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 h-[105%] w-[105%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-brand-maroon/10"
              />
              <div
                aria-hidden
                className="absolute bottom-0 left-1/2 h-[60%] w-[130%] -translate-x-1/2 rounded-full bg-brand-maroon/5 blur-[60px]"
              />
              <Image
                src={josephImg}
                alt="Joseph sharpening a knife"
                className="relative z-10 h-auto w-full drop-shadow-[0_16px_40px_rgba(90,31,31,0.15)]"
              />
            </div>

            {/* Story text */}
            <div className="flex-1">
              <span
                data-reveal
                className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-sage sm:text-xs"
              >
                {t("story.eyebrow")}
              </span>
              <h2
                data-reveal
                style={{ animationDelay: "100ms" }}
                className="mt-3 font-display text-3xl leading-tight text-brand-maroon sm:text-4xl lg:text-5xl"
              >
                {t("story.title")}
              </h2>

              <div className="mt-6 space-y-4 sm:mt-8">
                {(["origin", "community", "mission"] as const).map((key, i) => (
                  <p
                    key={key}
                    data-reveal
                    style={{ animationDelay: `${200 + i * 80}ms` }}
                    className="text-base leading-relaxed text-brand-ink/70 sm:text-lg"
                  >
                    {t(`story.paragraphs.${key}`)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Timeline ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-maroon py-20 text-brand-cream sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-brand-gold/8 blur-[140px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[48px_48px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6">
          <div className="text-center">
            <span
              data-reveal
              className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold sm:text-xs"
            >
              {t("milestones.eyebrow")}
            </span>
            <h2
              data-reveal
              style={{ animationDelay: "100ms" }}
              className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl"
            >
              {t("milestones.title")}
            </h2>
          </div>

          {/* Timeline */}
          <div ref={timelineRef} className="relative mt-14 sm:mt-20">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px sm:left-1/2 sm:-translate-x-1/2">
              <div
                data-timeline-line
                className="h-full w-full origin-top bg-gradient-to-b from-brand-gold/60 via-brand-gold/40 to-brand-gold/10"
              />
            </div>

            <div className="space-y-12 sm:space-y-16">
              {MILESTONE_KEYS.map((key, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div
                    key={key}
                    data-reveal={isEven ? undefined : undefined}
                    className={`relative flex items-start gap-6 sm:gap-0 ${
                      isEven ? "sm:flex-row" : "sm:flex-row-reverse"
                    }`}
                  >
                    {/* Dot */}
                    <div className="absolute left-6 top-1 z-10 flex h-3 w-3 -translate-x-1/2 items-center justify-center sm:left-1/2">
                      <span className="h-3 w-3 rounded-full border-2 border-brand-gold bg-brand-maroon" />
                    </div>

                    {/* Spacer for mobile (left side taken by line) */}
                    <div className="w-6 flex-shrink-0 sm:hidden" />

                    {/* Card */}
                    <div
                      data-reveal={isEven ? "left" : "right"}
                      style={{ animationDelay: `${200 + i * 100}ms` }}
                      className={`flex-1 sm:w-[calc(50%-2rem)] ${
                        isEven ? "sm:pr-12 sm:text-right" : "sm:pl-12 sm:text-left"
                      }`}
                    >
                      <span className="font-display text-2xl text-brand-gold">
                        {t(`milestones.items.${key}.year`)}
                      </span>
                      <h3 className="mt-1 text-lg font-semibold text-brand-cream sm:text-xl">
                        {t(`milestones.items.${key}.title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-brand-cream/60 sm:text-base">
                        {t(`milestones.items.${key}.description`)}
                      </p>
                    </div>

                    {/* Empty spacer for the other side */}
                    <div className="hidden flex-1 sm:block" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Values ─────────────────────────────────────────────── */}
      <section className="relative bg-brand-cream py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <span
              data-reveal
              className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-sage sm:text-xs"
            >
              {t("values.eyebrow")}
            </span>
            <h2
              data-reveal
              style={{ animationDelay: "100ms" }}
              className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl lg:text-5xl"
            >
              {t("values.title")}
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-6">
            {VALUE_KEYS.map((key, i) => (
              <div
                key={key}
                data-reveal
                style={{ animationDelay: `${200 + i * 120}ms` }}
                className="group relative overflow-hidden rounded-2xl border border-brand-maroon/8 bg-white/60 p-6 shadow-[0_2px_12px_-4px_rgba(90,31,31,0.06)] backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-brand-maroon/20 hover:shadow-[0_12px_40px_-12px_rgba(90,31,31,0.12)] sm:p-7"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-gold/0 via-brand-gold/0 to-brand-gold/[0.04] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-maroon/10 text-brand-maroon ring-1 ring-brand-maroon/15 transition-all duration-500 group-hover:bg-brand-maroon/15 group-hover:ring-brand-maroon/30">
                  {VALUE_ICONS[key]}
                </div>
                <h3 className="mt-5 font-display text-xl leading-snug text-brand-ink sm:text-2xl">
                  {t(`values.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-ink/60">
                  {t(`values.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
