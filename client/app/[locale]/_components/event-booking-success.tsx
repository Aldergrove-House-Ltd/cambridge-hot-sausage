"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, Receipt } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface SessionData {
  customer_name: string;
  customer_email: string;
  amount_total: number;
  currency: string;
  payment_status: string;
  receipt_url: string;
}

export function EventBookingSuccess() {
  const t = useTranslations("events.success");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    fetch(`/api/v1/orders/session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <section className="relative bg-brand-cream pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="mx-auto max-w-2xl px-6 text-center">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-maroon/20 border-t-brand-maroon" />
          </div>
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-sage/10">
              <CheckCircle className="h-10 w-10 text-brand-sage" strokeWidth={1.5} />
            </div>
            <span className="mt-6 block text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-sage sm:text-xs">
              {t("eyebrow")}
            </span>
            <h1 className="mt-3 font-display text-4xl text-brand-maroon sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-base text-brand-ink/60 sm:text-lg">
              {t("subtitle")}
            </p>

            {data && (
              <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-brand-maroon/8 bg-white/60 p-6 text-left backdrop-blur-sm">
                {data.customer_name && (
                  <p className="text-sm font-semibold text-brand-ink">{data.customer_name}</p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-brand-maroon/5 pt-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-brand-ink/50">
                    {t("total")}
                  </span>
                  <span className="font-display text-2xl text-brand-maroon">
                    £{data.amount_total.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {data?.receipt_url && (
                <a
                  href={data.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-brand-maroon bg-white/60 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-brand-maroon backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-brand-maroon/5"
                >
                  <Receipt size={16} /> View receipt
                </a>
              )}
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-brand-maroon px-6 py-3 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_10px_25px_-8px_rgba(90,31,31,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_35px_-8px_rgba(90,31,31,0.55)]"
              >
                {t("backToHome")}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
