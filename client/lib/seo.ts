import type { Metadata } from "next";

import { routing } from "@/i18n/routing";

export const SITE_URL = "https://www.hotsausagecompany.com";
export const SITE_NAME = "The Hot Sausage Company";
export const SITE_TAGLINE = "Hot Dogs on Fitzroy Street since 1986";
export const SITE_DESCRIPTION =
  "Cambridge's famous hot dogs — served from a Victorian-style barrow on Fitzroy Street since 1986. Order online, book us for events, or visit the barrow.";
// Served by app/opengraph-image.tsx (dynamic ImageResponse, 1200×630).
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

/**
 * Build the canonical URL for a page in a given locale.
 *
 * next-intl is configured with `localePrefix: "as-needed"`, so the default
 * locale (en) lives at the bare path and other locales sit under `/<locale>/`.
 */
export function canonicalFor(path: string, locale: string = routing.defaultLocale): string {
  const cleanPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) return `${SITE_URL}${cleanPath}`;
  return `${SITE_URL}/${locale}${cleanPath}`;
}

/**
 * Build `<link rel="alternate" hreflang="..."` map for one logical page.
 */
function hreflangAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = canonicalFor(path, locale);
  }
  languages["x-default"] = canonicalFor(path, routing.defaultLocale);
  return languages;
}

interface PageMetadataArgs {
  /** Page title shown in the browser tab. Wrapped by the layout template. */
  title: string;
  /** Page description for SEO + social cards. */
  description: string;
  /** Path relative to site root (e.g. `/shop`). */
  path: string;
  /** Locale of this rendering. */
  locale: string;
  /** Optional explicit Open Graph image; defaults to the site OG card. */
  image?: string | null;
  /** OpenGraph type — defaults to `website`. Note: Next.js's typed
   *  metadata limits OG type to its enum; product-specific structured
   *  data lives in the JSON-LD blocks instead. */
  type?: "website" | "article";
}

export function pageMetadata({
  title,
  description,
  path,
  locale,
  image,
  type = "website",
}: PageMetadataArgs): Metadata {
  const url = canonicalFor(path, locale);
  // Next.js replaces parent `openGraph` wholesale when a page returns its own
  // `openGraph` block (no field-level merge), so every page must spell out
  // the image — fall back to the site-wide default.
  const ogImage = image || DEFAULT_OG_IMAGE;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: hreflangAlternates(path),
    },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    } as Metadata["twitter"],
  };
}
