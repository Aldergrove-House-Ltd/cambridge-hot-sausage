"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import josephImg from "@/img/about/joseph-01.webp";

gsap.registerPlugin(ScrollTrigger);

export function AboutHero() {
  const t = useTranslations("about");
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!imageRef.current) return;

      // Parallax drift — image moves slower than scroll
      gsap.to(imageRef.current, {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-brand-maroon pt-28 text-brand-cream sm:pt-36"
    >
      {/* Decorative backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/4 h-[600px] w-[600px] rounded-full bg-brand-gold/8 blur-[160px]" />
        <div className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-brand-sage/10 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-end lg:gap-12">
          {/* Text column — pb accounts for the 80px bottom curve so the badge
              keeps breathing room above the cream transition. */}
          <div className="flex-1 pb-24 text-center lg:pb-36 lg:text-left">
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
              className="mx-auto mt-5 max-w-lg text-balance text-base text-brand-cream/70 sm:mt-6 sm:text-lg lg:mx-0"
            >
              {t("hero.subtitle")}
            </p>

            {/* Est. badge */}
            <div
              data-reveal
              style={{ animationDelay: "350ms" }}
              className="mt-8 inline-flex items-center gap-3 rounded-full border border-brand-gold/25 bg-brand-cream/[0.04] px-5 py-2.5 backdrop-blur-sm"
            >
              <span className="font-display text-2xl text-brand-gold">40</span>
              <span className="text-xs leading-tight text-brand-cream/60">
                years on
                <br />
                Fitzroy Street
              </span>
            </div>
          </div>

          {/* Joseph image — transparent PNG floating over maroon */}
          <div
            ref={imageRef}
            className="relative w-[280px] flex-shrink-0 sm:w-[340px] lg:w-[400px]"
          >
            {/* Glow behind Joseph */}
            <div
              aria-hidden
              className="absolute bottom-0 left-1/2 h-[80%] w-[120%] -translate-x-1/2 rounded-full bg-brand-gold/15 blur-[80px]"
            />
            <Image
              src={josephImg}
              alt="Joseph holding a Cambridge hot dog"
              priority
              className="relative z-10 h-auto w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            />
          </div>
        </div>
      </div>

      {/* Bottom curve transition to cream */}
      <div className="absolute inset-x-0 -bottom-1 z-20">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80V40C240 10 480 0 720 0s480 10 720 40v40H0Z"
            className="fill-brand-cream"
          />
        </svg>
      </div>
    </section>
  );
}
