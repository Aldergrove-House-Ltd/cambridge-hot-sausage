import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Rye } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";
import { Navbar } from "./_components/navbar";
import { Footer } from "./_components/footer";
import { SmoothScroll } from "./_components/smooth-scroll";
import { RevealOnScroll } from "./_components/reveal-on-scroll";
import { QueryProvider } from "./_components/query-provider";
import { CartProvider } from "@/lib/cart/context";
import { CartDrawer } from "./_components/cart-drawer";
import { CookieConsent } from "./_components/cookie-consent";
import "../globals.css";

const rye = Rye({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-rye",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // Home page (no per-page override) gets a rich, search-friendly default;
    // every other page overrides title.absolute / title via the template.
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false, email: false, address: false },
  keywords: [
    "Cambridge hot dog",
    "Cambridge hot sausage",
    "best hot dog Cambridge",
    "Fitzroy Street",
    "Cambridge street food",
    "hot dog catering Cambridge",
    "Cambridge event catering",
    "Hot Sausage Company",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        // Served by app/opengraph-image.tsx (dynamic ImageResponse, 1200×630).
        // Referenced explicitly here so every child page inherits it without
        // relying on file-based detection across segments.
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#5A1F1F",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Schema.org structured data describing the business. Helps Google's
 * local pack, the Knowledge Graph, and (increasingly) LLM-powered search
 * understand who/what/where we are.
 */
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["FoodEstablishment", "LocalBusiness"],
  "@id": `${SITE_URL}/#business`,
  name: SITE_NAME,
  alternateName: ["Hot Sausage Company", "Cambridge Hot Sausage"],
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  image: `${SITE_URL}/opengraph-image`,
  description: SITE_DESCRIPTION,
  foundingDate: "1986",
  slogan: SITE_TAGLINE,
  priceRange: "£",
  servesCuisine: ["Hot Dogs", "British Street Food", "Sausages"],
  paymentAccepted: "Cash, Credit Card, Debit Card",
  currenciesAccepted: "GBP",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Pitch 14, Fitzroy Street",
    addressLocality: "Cambridge",
    addressRegion: "Cambridgeshire",
    postalCode: "CB1 1ER",
    addressCountry: "GB",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 52.20668,
    longitude: 0.12983,
  },
  areaServed: {
    "@type": "City",
    name: "Cambridge",
  },
  hasMap: "https://www.google.com/maps/search/?api=1&query=Cambridge+Hot+Sausage+Fitzroy+Street",
  sameAs: [
    "https://www.hotsausagecompany.com",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  publisher: { "@id": `${SITE_URL}/#business` },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/shop?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
  inLanguage: routing.locales,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html lang={locale} className={rye.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground">
        {/* Schema.org JSON-LD — emitted server-side so Google and LLM crawlers
            see it immediately, with no JS execution required. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <NextIntlClientProvider>
          <QueryProvider>
            <CartProvider>
              <SmoothScroll />
              <RevealOnScroll />
              <Navbar />
              <CartDrawer />
              {children}
              <Footer />
              <CookieConsent />
            </CartProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

