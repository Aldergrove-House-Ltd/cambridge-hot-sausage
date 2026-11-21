import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { AboutHero } from "../_components/about-hero";
import { AboutStory } from "../_components/about-story";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.meta" });
  return pageMetadata({
    title: t("title"),
    description:
      "The Hot Sausage Company has served the city's famous hot dogs from a Victorian-style barrow on Fitzroy Street since 1986. Meet the family, the recipe, and the regulars.",
    path: "/about",
    locale,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative">
      <AboutHero />
      <AboutStory />
    </main>
  );
}
