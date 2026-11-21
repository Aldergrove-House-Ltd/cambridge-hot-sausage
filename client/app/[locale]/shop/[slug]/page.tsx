import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProduct } from "@/lib/shop/server";
import { canonicalFor, pageMetadata, SITE_URL } from "@/lib/seo";
import { ShopProductDetail } from "../../_components/shop-product-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "shop.meta" });

  try {
    const product = await getProduct(slug);
    const image = product.images?.[0]?.image;
    const description = product.description
      ? product.description.replace(/[#*_>`~\n]/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)
      : `Order ${product.name} from The Hot Sausage Company — fresh from the Fitzroy Street barrow.`;
    return pageMetadata({
      title: t("productTitle", { name: product.name }),
      description,
      path: `/shop/${slug}`,
      locale,
      image,
      // Next.js's typed OpenGraph doesn't include "product" — the rich
      // product structured data is emitted as JSON-LD in the page body.
      type: "article",
    });
  } catch {
    return pageMetadata({
      title: t("title"),
      description: "Browse The Hot Sausage Company products.",
      path: `/shop/${slug}`,
      locale,
    });
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let product;
  try {
    product = await getProduct(slug);
  } catch {
    notFound();
  }

  const prices = product.variants
    .map((v) => Number(v.price))
    .filter((n) => Number.isFinite(n));
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const productUrl = canonicalFor(`/shop/${slug}`, locale);

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.slice(0, 5000),
    sku: product.variants[0]?.sku,
    url: productUrl,
    brand: { "@type": "Brand", name: "The Hot Sausage Company" },
    image: product.images?.map((i) => i.image).filter(Boolean),
  };
  if (minPrice !== null && maxPrice !== null) {
    productJsonLd.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "GBP",
      lowPrice: minPrice.toFixed(2),
      highPrice: maxPrice.toFixed(2),
      offerCount: product.variants.length,
      availability: product.variants.some((v) => v.in_stock)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE_URL}/#business` },
    };
  }
  if (product.average_rating !== null && product.review_count > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.average_rating,
      reviewCount: product.review_count,
    };
  }

  return (
    <main className="relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ShopProductDetail product={product} />
    </main>
  );
}
