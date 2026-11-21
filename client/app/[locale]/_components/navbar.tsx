"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import logo from "@/img/logo.png";
import cartIcon from "@/img/cart.png";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/context";
import { LocaleSwitcher } from "./locale-switcher";

type NavKey = "about" | "events" | "shop" | "contact";

// The logo is the home link; Locations and Reviews live in the footer only.
const NAV_ITEMS: { key: NavKey; href: string }[] = [
  { key: "about", href: "/about" },
  { key: "events", href: "/events" },
  { key: "shop", href: "/shop" },
  { key: "contact", href: "/contact" },
];

export function Navbar() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const { totalItems, openDrawer } = useCart();
  const headerRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerListRef = useRef<HTMLUListElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Lazy-load gsap and run the entry animation. The header markup renders
  // immediately at full opacity; the only thing deferred is the animation,
  // which is a no-op for first-meaningful-paint anyway.
  useEffect(() => {
    if (typeof window === "undefined" || !headerRef.current) return;
    let cancelled = false;
    let ctx: { revert: () => void } | null = null;

    (async () => {
      const { default: gsap } = await import("gsap");
      if (cancelled || !headerRef.current) return;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".nav-logo", { x: -20, opacity: 0, duration: 0.6 })
          .from(
            ".nav-link",
            { y: -12, opacity: 0, duration: 0.45, stagger: 0.06 },
            "-=0.35",
          )
          .from(".nav-tail > *", { y: -10, opacity: 0, duration: 0.4, stagger: 0.06 }, "-=0.3");
      }, headerRef.current);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  // Mobile drawer animation — bg fades in slowly, content reveals after.
  useEffect(() => {
    if (typeof window === "undefined" || !drawerRef.current || !drawerListRef.current) return;
    let cancelled = false;

    (async () => {
      const { default: gsap } = await import("gsap");
      if (cancelled || !drawerRef.current || !drawerListRef.current) return;

      if (open) {
        gsap.set(drawerRef.current, { display: "flex" });
        gsap.fromTo(
          drawerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.55, ease: "power2.out" },
        );
        gsap.fromTo(
          drawerListRef.current.children,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.07,
            delay: 0.25,
          },
        );
      } else {
        gsap.to(drawerRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            if (drawerRef.current) drawerRef.current.style.display = "none";
          },
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        data-scrolled={scrolled || pathname !== "/" || undefined}
        className="fixed inset-x-0 top-0 z-50 transition-[backdrop-filter,background-color,border-color] duration-300 data-[scrolled]:border-b data-[scrolled]:border-brand-maroon/10 data-[scrolled]:bg-brand-cream/90 data-[scrolled]:backdrop-blur-lg"
      >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 transition-all duration-300 data-[scrolled]:py-2 sm:px-6">
        <Link
          href="/"
          className="nav-logo group relative flex items-center transition-transform duration-300 hover:-translate-y-0.5"
          aria-label={t("brand")}
        >
          <Image
            src={logo}
            alt={t("brand")}
            priority
            className="h-12 w-auto transition-all duration-300 group-hover:drop-shadow-[0_4px_12px_rgba(90,31,31,0.25)]"
          />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map(({ key, href }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={key} className="nav-link">
                <Link
                  href={href}
                  className="group relative inline-flex items-center px-3 py-2 text-sm font-medium uppercase tracking-wider text-brand-ink transition-colors hover:text-brand-maroon"
                  data-active={isActive || undefined}
                >
                  <span>{t(`nav.${key}`)}</span>
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-brand-maroon transition-transform duration-300 ease-out group-hover:scale-x-100 group-data-[active]:scale-x-100"
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="nav-tail flex items-center gap-2">
          <button
            type="button"
            onClick={openDrawer}
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-maroon/10"
            aria-label="Cart"
          >
            <Image
              src={cartIcon}
              alt=""
              aria-hidden
              className="h-6 w-6 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-maroon px-1 text-[10px] font-bold text-brand-cream">
                {totalItems}
              </span>
            )}
          </button>
          <LocaleSwitcher />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("actions.closeMenu") : t("actions.openMenu")}
            aria-expanded={open}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-maroon/10 lg:hidden"
          >
            <span className="relative block h-4 w-6">
              <span
                className={`absolute left-0 top-0 h-0.5 w-full rounded bg-current transition-transform duration-300 ${
                  open ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded bg-current transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-full rounded bg-current transition-transform duration-300 ${
                  open ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      </header>

      {/* Mobile drawer — sibling of header so its z-index isn't trapped
          inside the header's stacking context. Sits above EVERYTHING. */}
      <div
        ref={drawerRef}
        className="fixed inset-0 top-0 z-[100] hidden flex-col bg-brand-cream/97 backdrop-blur-2xl lg:hidden"
        style={{ display: "none" }}
      >
        <div className="flex h-[68px] items-center justify-between px-4 sm:px-6">
          {/* The drawer covers the header, so repeat the logo here as the home link */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center"
            aria-label={t("brand")}
          >
            <Image src={logo} alt={t("brand")} className="h-12 w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("actions.closeMenu")}
            className="group inline-flex h-12 w-12 items-center justify-center rounded-full text-brand-ink ring-1 ring-brand-maroon/15 transition-all duration-300 hover:rotate-90 hover:bg-brand-maroon hover:text-brand-cream hover:ring-brand-maroon"
          >
            <X className="h-5 w-5" strokeWidth={2.4} aria-hidden />
          </button>
        </div>
        <ul ref={drawerListRef} className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-16">
          {NAV_ITEMS.map(({ key, href }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={key} className="w-full max-w-sm">
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block text-center font-display text-3xl uppercase tracking-wide text-brand-ink transition-colors hover:text-brand-maroon data-[active]:text-brand-maroon"
                  data-active={isActive || undefined}
                >
                  {t(`nav.${key}`)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
