import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { EventBooking } from "../_components/event-booking";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events.meta" });
  return pageMetadata({
    title: t("title"),
    description:
      "Hire The Hot Sausage Company for your wedding, college ball, corporate event or private party. Live calendar, instant quote, single-day bookings across Cambridgeshire and beyond.",
    path: "/events",
    locale,
  });
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative overflow-hidden">
      <EventBooking />
    </main>
  );
}
