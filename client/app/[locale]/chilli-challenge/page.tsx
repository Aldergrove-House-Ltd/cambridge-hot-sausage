import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Flame, Trophy, AlertTriangle, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    title: "Chilli Challenge",
    description:
      "Four levels of heat, four legendary sausages and one Wall of Flame. Take The Hot Sausage Company's chilli challenge at the Fitzroy Street barrow.",
    path: "/chilli-challenge",
    locale,
  });
}

const LEVELS = [
  { name: "Warm Up", heat: 1, sausage: "Jalapeño Kick", description: "A gentle introduction. Green jalapeño and mild chilli flakes.", color: "bg-green-500" },
  { name: "Sweating", heat: 2, sausage: "Habanero Heat", description: "Things start getting serious. Habanero pepper with scotch bonnet relish.", color: "bg-yellow-500" },
  { name: "Ring of Fire", heat: 3, sausage: "Ghost Pepper Fury", description: "Bhut jolokia-infused sausage with reaper sauce. Most tap out here.", color: "bg-orange-500" },
  { name: "The Reaper", heat: 4, sausage: "Carolina Reaper Doom", description: "Our hottest creation. Carolina Reaper sausage, ghost pepper sauce, and a signed waiver.", color: "bg-red-600" },
];

export default async function ChilliChallengePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative bg-brand-maroon pt-28 pb-20 text-brand-cream sm:pt-36 sm:pb-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-red-500/10 blur-[140px]" />
          <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[48px_48px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Flame className="mx-auto h-16 w-16 text-red-400" strokeWidth={1.5} />
          <h1 data-reveal className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            The Chilli Challenge
          </h1>
          <p data-reveal style={{ animationDelay: "100ms" }} className="mx-auto mt-5 max-w-xl text-balance text-base text-brand-cream/70 sm:text-lg">
            Four levels of heat. Four legendary sausages. One question: how far can you go?
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-brand-cream py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <span data-reveal className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-sage sm:text-xs">
              How it works
            </span>
            <h2 data-reveal style={{ animationDelay: "100ms" }} className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
              The rules are simple
            </h2>
          </div>

          <div data-reveal style={{ animationDelay: "200ms" }} className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-brand-maroon/8 bg-white/60 p-6 text-center backdrop-blur-sm">
              <Clock className="mx-auto h-8 w-8 text-brand-maroon/60" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-lg text-brand-maroon">Eat all four</h3>
              <p className="mt-2 text-sm text-brand-ink/55">Work your way through all four levels, from mild to insane.</p>
            </div>
            <div className="rounded-2xl border border-brand-maroon/8 bg-white/60 p-6 text-center backdrop-blur-sm">
              <AlertTriangle className="mx-auto h-8 w-8 text-brand-maroon/60" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-lg text-brand-maroon">No drinks for 5 min</h3>
              <p className="mt-2 text-sm text-brand-ink/55">After the final sausage, survive five minutes with no water or milk.</p>
            </div>
            <div className="rounded-2xl border border-brand-maroon/8 bg-white/60 p-6 text-center backdrop-blur-sm">
              <Trophy className="mx-auto h-8 w-8 text-brand-gold" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-lg text-brand-maroon">Claim your glory</h3>
              <p className="mt-2 text-sm text-brand-ink/55">Complete it and your name goes on our Wall of Flame. Plus a free t-shirt.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The levels */}
      <section className="bg-brand-cream pb-20 sm:pb-28">
        <div className="mx-auto max-w-3xl px-6">
          <h2 data-reveal className="text-center font-display text-3xl text-brand-maroon sm:text-4xl">
            The four levels
          </h2>

          <div className="mt-10 space-y-4">
            {LEVELS.map((level, i) => (
              <div
                key={level.name}
                data-reveal
                style={{ animationDelay: `${i * 100}ms` }}
                className="overflow-hidden rounded-2xl border border-brand-maroon/8 bg-white/60 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4 p-5 sm:p-6">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-ink/40">Lvl {i + 1}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 4 }, (_, j) => (
                        <Flame key={j} size={14} className={j <= i ? "text-red-500" : "text-gray-200"} fill={j <= i ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <div className={`h-12 w-1 rounded-full ${level.color}`} />
                  <div className="flex-1">
                    <h3 className="font-display text-lg text-brand-maroon sm:text-xl">{level.name}</h3>
                    <p className="text-sm font-medium text-brand-ink/70">{level.sausage}</p>
                    <p className="mt-1 text-xs text-brand-ink/45">{level.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div data-reveal className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
            <p className="mt-3 text-sm font-medium text-red-800">
              Participants must be 18+. A waiver must be signed before attempting Level 4.
              We reserve the right to refuse service. This challenge is not for the faint-hearted.
            </p>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/locations"
              className="inline-flex items-center gap-2 rounded-full bg-brand-maroon px-8 py-4 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_15px_35px_-12px_rgba(90,31,31,0.5)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_45px_-12px_rgba(90,31,31,0.65)]"
            >
              <Flame size={18} />
              Visit us to take the challenge
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
