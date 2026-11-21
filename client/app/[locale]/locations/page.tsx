import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { LocationsHero } from "../_components/locations-hero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "locations.meta" });
  return pageMetadata({
    title: t("title"),
    description:
      "Find The Hot Sausage Company's barrow at Pitch 14, Fitzroy Street, Cambridge CB1 1ER. Opening hours, directions and a live map of where we are today.",
    path: "/locations",
    locale,
  });
}

export default async function LocationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative overflow-hidden">
      <LocationsHero />
    </main>
  );
}
