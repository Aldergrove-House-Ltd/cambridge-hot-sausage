import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import { HeroIntro } from "./_components/hero-intro";
import { Certifications } from "./_components/certifications";
import { Moments } from "./_components/moments";
import { EventBookingCta } from "./_components/event-booking-cta";
import { LocateUs } from "./_components/locate-us";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    // `title.absolute` short-circuits the layout's template — keeps the home
    // tab clean: "The Hot Sausage Company — Hot Dogs on Fitzroy Street since 1986"
    // instead of "X · The Hot Sausage Company".
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Cambridge's famous hot dogs. Victorian-style barrow at Pitch 14, Fitzroy Street — serving the legendary Cambridge sausage since 1986. Order online, book us for events, or visit us in town.",
    path: "/",
    locale,
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative">
      <section className="sticky top-0 z-0 h-dvh">
        <HeroIntro />
      </section>
      <Certifications />
      <EventBookingCta />
      <Moments />
      <LocateUs />
    </main>
  );
}
