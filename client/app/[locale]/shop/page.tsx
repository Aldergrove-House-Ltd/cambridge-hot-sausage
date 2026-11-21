import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { getCategories, getProducts } from "@/lib/shop/server";
import { ShopListing } from "../_components/shop-listing";

// Revalidate every 60 seconds — serves cached HTML to visitors,
// refreshes in the background. New products appear within 1 minute.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop.meta" });
  return pageMetadata({
    title: t("title"),
    description:
      "Shop hot dog gift cards, sauces and merchandise from The Hot Sausage Company, serving Cambridge from our Fitzroy Street barrow since 1986.",
    path: "/shop",
    locale,
  });
}

const EMPTY_PRODUCTS = { count: 0, next: null, previous: null, results: [] };

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // SSR: fetch initial data so the HTML is SEO-ready.
  // Graceful fallback if Django is unreachable (dev startup race).
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let products: Awaited<ReturnType<typeof getProducts>> = EMPTY_PRODUCTS;

  try {
    [categories, products] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);
  } catch {
    // Django not ready — page renders empty, client hydrates from API
  }

  return (
    <main className="relative overflow-hidden">
      <ShopListing initialCategories={categories} initialProducts={products} />
    </main>
  );
}
