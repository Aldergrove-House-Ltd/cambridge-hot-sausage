import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { ReviewsHero } from "../_components/reviews-hero";
import { ReviewsFeed } from "../_components/reviews-feed";
import { getGoogleReviews } from "@/lib/reviews/server";

// Re-render at most once a minute; the backend caches Google's response
// for longer, so this never means a Google request per visitor.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews.meta" });
  return pageMetadata({
    title: t("title"),
    description:
      "What Cambridge thinks of us. Real reviews from regulars, students and visitors who have stopped at the Fitzroy Street barrow over the years.",
    path: "/reviews",
    locale,
  });
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Real 4★/5★ Google reviews of the Fitzroy Street listing.
  const { reviews, summary } = await getGoogleReviews(locale);

  return (
    <main className="relative">
      <ReviewsHero summary={summary} />
      <ReviewsFeed reviews={reviews} summary={summary} />
    </main>
  );
}
