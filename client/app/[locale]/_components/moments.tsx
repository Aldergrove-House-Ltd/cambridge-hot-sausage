"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// TODO: replace with final asset URLs (Cloudinary) when ready.
const PHOTOS: { src: string; alt: string; w: number; h: number }[] = [
  {
    src: "https://www.hotsausagecompany.com/wp-content/uploads/2022/03/downloadwedding.webp",
    alt: "The Hot Sausage Company at a wedding",
    w: 1024,
    h: 768,
  },
  {
    src: "https://www.hotsausagecompany.com/wp-content/uploads/2022/03/D93065F5-7B75-4242-8E1A-0EA8910C8F67_1610880375.jpeg",
    alt: "Behind the barrow",
    w: 1024,
    h: 1024,
  },
  {
    src: "https://www.hotsausagecompany.com/wp-content/uploads/2022/03/IMG_1374-1024x575.jpg",
    alt: "Fitzroy Street regulars",
    w: 1024,
    h: 575,
  },
  {
    src: "https://www.hotsausagecompany.com/wp-content/uploads/2022/03/8234e7ab-7da6-4dcb-b606-291fe0ccb382-1-1024x768.jpg",
    alt: "Service with a smile",
    w: 1024,
    h: 768,
  },
  {
    src: "https://www.hotsausagecompany.com/wp-content/uploads/2022/03/IMG_1676-1024x768.jpg",
    alt: "Sausages on the grill",
    w: 1024,
    h: 768,
  },
  {
    src: "https://www.hotsausagecompany.com/wp-content/uploads/2022/03/IMG_1392-1024x575.jpg",
    alt: "Late-night Cambridge",
    w: 1024,
    h: 575,
  },
  {
    src: "https://www.hotsausagecompany.com/wp-content/uploads/2022/03/download-090-918x1024.webp",
    alt: "The Victorian-style barrow",
    w: 918,
    h: 1024,
  },
  {
    src: "https://www.hotsausagecompany.com/wp-content/uploads/2022/03/download-101-1024x768.webp",
    alt: "Cambridge celebrations",
    w: 1024,
    h: 768,
  },
];

export function Moments() {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("home.moments");

  useGSAP(
    () => {
      if (!root.current || !trackRef.current || !progressRef.current) return;

      const root_ = root.current;
      const track = trackRef.current;
      const progress = progressRef.current;

      const ctx = gsap.context(() => {
        // Pinned horizontal scroll
        const getDistance = () => track.scrollWidth - window.innerWidth;

        const tween = gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: root_,
            start: "top top",
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              progress.style.transform = `scaleX(${self.progress})`;
            },
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      }, root_);

      return () => ctx.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="moments"
      className="relative z-10 h-dvh overflow-hidden bg-brand-cream"
    >
      <div className="flex h-full flex-col">
        {/* Heading row */}
        <div className="shrink-0 px-6 pb-4 pt-20 text-center sm:pb-6 sm:pt-24">
          <span
            data-reveal
            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-sage sm:text-xs"
          >
            {t("eyebrow")}
          </span>
          <h2
            data-reveal
            style={{ animationDelay: "100ms" }}
            className="mt-2 font-display text-3xl leading-tight text-brand-maroon sm:mt-3 sm:text-4xl lg:text-5xl"
          >
            {t("title")}
          </h2>
          <p
            data-reveal
            style={{ animationDelay: "200ms" }}
            className="mx-auto mt-2 max-w-2xl text-balance text-sm text-brand-ink/70 sm:mt-3 sm:text-base"
          >
            {t("subtitle")}
          </p>
        </div>

        {/* Photo track — fills remaining height */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div
            ref={trackRef}
            className="flex h-full w-max items-stretch gap-5 pl-[10vw] pr-[10vw] will-change-transform sm:gap-8"
          >
            {PHOTOS.map((p, i) => (
              <figure
                key={p.src}
                className="group relative h-full shrink-0 overflow-hidden rounded-3xl bg-brand-ink/5 shadow-[0_30px_60px_-25px_rgba(43,43,43,0.45)] ring-1 ring-brand-maroon/10 transition-transform duration-500 ease-out hover:-translate-y-2"
                style={{ aspectRatio: `${p.w} / ${p.h}` }}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="60vh"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-ink/70 via-brand-ink/20 to-transparent px-5 pb-4 pt-12 text-xs font-medium uppercase tracking-wider text-brand-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {String(i + 1).padStart(2, "0")} · {p.alt}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Scroll hint + progress bar */}
        <div className="shrink-0 px-6 pb-6 pt-4 sm:pb-8">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-ink/50">
              {t("hint")}
            </span>
            <div className="h-px w-full overflow-hidden bg-brand-maroon/15">
              <div
                ref={progressRef}
                className="h-full w-full origin-left scale-x-0 bg-brand-maroon"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
