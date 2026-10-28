"use client";

import { type FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Mail, MapPin, Phone, Send } from "lucide-react";

export function ContactForm() {
  const t = useTranslations("contact");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, website: "" }),
      });
      if (!res.ok) {
        // Surface DRF's field-level validation message so the user sees
        // what to fix instead of a generic "something went wrong".
        const body = await res.json().catch(() => null);
        const firstError = body && typeof body === "object"
          ? Object.values(body).flat().find((v) => typeof v === "string")
          : null;
        throw new Error((firstError as string) || `${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => setSubmitted(true),
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    // Honeypot — silently "succeed" if bot fills it
    if (form.get("website")) {
      setSubmitted(true);
      return;
    }

    mutation.mutate({
      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: (form.get("phone") as string) || "",
      subject: form.get("subject") as string,
      message: form.get("message") as string,
    });
  }

  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-brand-maroon pt-28 pb-20 text-brand-cream sm:pt-36 sm:pb-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-gold/8 blur-[140px]" />
          <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-sage/10 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[48px_48px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <span
            data-reveal
            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold sm:text-xs"
          >
            {t("hero.eyebrow")}
          </span>
          <h1
            data-reveal
            style={{ animationDelay: "100ms" }}
            className="mt-3 font-display text-4xl leading-[1.1] sm:mt-4 sm:text-5xl lg:text-6xl"
          >
            {t("hero.title")}
          </h1>
          <p
            data-reveal
            style={{ animationDelay: "200ms" }}
            className="mx-auto mt-5 max-w-xl text-balance text-base text-brand-cream/70 sm:mt-6 sm:text-lg"
          >
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      {/* ─── Form + Info ───────────────────────────────────────── */}
      <section className="relative bg-brand-cream py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-brand-gold/8 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6">
          <div className="grid gap-10 lg:grid-cols-5 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div
                  data-reveal
                  className="flex flex-col items-center rounded-3xl border border-brand-sage/20 bg-brand-sage/5 px-8 py-16 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-sage/10">
                    <CheckCircle className="h-8 w-8 text-brand-sage" strokeWidth={1.5} />
                  </div>
                  <p className="mt-6 text-lg font-medium text-brand-sage">
                    {t("form.success")}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  data-reveal
                  className="space-y-5 rounded-3xl border border-brand-maroon/8 bg-white/60 p-6 backdrop-blur-sm sm:p-8"
                >
                  {/* Honeypot */}
                  <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
                    <label htmlFor="contact-website">Website</label>
                    <input type="url" id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
                  </div>

                  {/* Name + Email row */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                        {t("form.name")}
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        maxLength={150}
                        className="w-full rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/30 transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                        {t("form.email")}
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/30 transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
                      />
                    </div>
                  </div>

                  {/* Phone + Subject row */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                        {t("form.phone")}
                      </label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        maxLength={20}
                        className="w-full rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/30 transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-subject" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                        {t("form.subject")}
                      </label>
                      <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        required
                        minLength={3}
                        maxLength={200}
                        className="w-full rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/30 transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                      {t("form.message")}
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={5}
                      className="w-full resize-none rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/30 transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
                    />
                  </div>

                  {mutation.isError && (
                    <p className="text-sm text-red-600">
                      {mutation.error instanceof Error && mutation.error.message && !/^\d+$/.test(mutation.error.message)
                        ? mutation.error.message
                        : t("form.error")}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="group inline-flex items-center gap-2.5 rounded-full bg-brand-maroon px-8 py-4 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_15px_35px_-12px_rgba(90,31,31,0.5)] transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_20px_45px_-12px_rgba(90,31,31,0.65)] active:scale-100 disabled:opacity-50"
                  >
                    <Send size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    {mutation.isPending ? t("form.submitting") : t("form.submit")}
                  </button>
                </form>
              )}
            </div>

            {/* Contact info sidebar */}
            <div className="space-y-6 lg:col-span-2 lg:pt-4">
              <h2
                data-reveal
                className="font-display text-2xl text-brand-maroon sm:text-3xl"
              >
                {t("info.title")}
              </h2>

              <div data-reveal style={{ animationDelay: "100ms" }}>
                <div className="group flex items-start gap-4 rounded-2xl border border-brand-maroon/6 bg-white/60 p-5 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-0.5 hover:border-brand-maroon/15 hover:shadow-[0_8px_24px_-8px_rgba(90,31,31,0.08)]">
                  <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-maroon/10 text-brand-maroon ring-1 ring-brand-maroon/15">
                    <MapPin size={18} strokeWidth={1.6} />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-sage">
                      {t("info.address.label")}
                    </span>
                    <p className="mt-1 text-sm text-brand-ink/70">{t("info.address.value")}</p>
                  </div>
                </div>
              </div>

              <div data-reveal style={{ animationDelay: "200ms" }}>
                <div className="group flex items-start gap-4 rounded-2xl border border-brand-maroon/6 bg-white/60 p-5 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-0.5 hover:border-brand-maroon/15 hover:shadow-[0_8px_24px_-8px_rgba(90,31,31,0.08)]">
                  <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-maroon/10 text-brand-maroon ring-1 ring-brand-maroon/15">
                    <Mail size={18} strokeWidth={1.6} />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-sage">
                      {t("info.email.label")}
                    </span>
                    <p className="mt-1 text-sm text-brand-ink/70">{t("info.email.value")}</p>
                  </div>
                </div>
              </div>

              <div data-reveal style={{ animationDelay: "300ms" }}>
                <div className="group flex items-start gap-4 rounded-2xl border border-brand-maroon/6 bg-white/60 p-5 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-0.5 hover:border-brand-maroon/15 hover:shadow-[0_8px_24px_-8px_rgba(90,31,31,0.08)]">
                  <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-maroon/10 text-brand-maroon ring-1 ring-brand-maroon/15">
                    <Phone size={18} strokeWidth={1.6} />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-sage">
                      {t("info.phone.label")}
                    </span>
                    <p className="mt-1 text-sm text-brand-ink/70">{t("info.phone.value")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
