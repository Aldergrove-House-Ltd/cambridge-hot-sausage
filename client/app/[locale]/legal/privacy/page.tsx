import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    title: "Privacy Policy",
    description:
      "How The Hot Sausage Company collects, uses and protects your personal data under UK GDPR.",
    path: "/legal/privacy",
    locale,
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative overflow-hidden">
      <section className="bg-brand-cream pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="font-display text-3xl text-brand-maroon sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-brand-ink/40">
            Last updated: April 2026
          </p>

          <div className="prose prose-sm mt-8 max-w-none text-brand-ink/70">
            <h2>1. What We Collect</h2>
            <p>
              When you use our website, place an order, or book an event,
              The Hot Sausage Company may collect the following personal
              information:
            </p>
            <ul>
              <li>
                Name, email address, telephone number, and postal address
              </li>
              <li>
                Payment details (processed securely by Stripe — we never store
                card numbers)
              </li>
              <li>Event booking details, including date, location, and guest count</li>
              <li>Messages submitted through our contact form</li>
              <li>
                Technical data such as IP address, browser type, and pages
                visited
              </li>
            </ul>

            <h2>2. How We Use It</h2>
            <p>We use your personal data to:</p>
            <ul>
              <li>Fulfil orders and process payments</li>
              <li>Confirm and manage event bookings</li>
              <li>Respond to enquiries submitted via the contact form</li>
              <li>Improve our website and services</li>
              <li>
                Comply with legal obligations under the laws of England and Wales
              </li>
            </ul>
            <p>
              We will never sell your personal data to third parties. We only
              share information where necessary to provide our services or where
              required by law.
            </p>

            <h2>3. Cookies</h2>
            <p>
              Our website uses essential cookies to maintain your session and
              protect against cross-site request forgery. We do not currently use
              analytics cookies. For full details, please see our{" "}
              <a href="/legal/cookies" className="text-brand-maroon underline">
                Cookie Policy
              </a>
              .
            </p>

            <h2>4. Third Parties</h2>
            <p>
              We rely on the following third-party services to operate our
              website:
            </p>
            <ul>
              <li>
                <strong>Stripe</strong> — payment processing. Stripe may set its
                own cookies and collect data in accordance with its own privacy
                policy.
              </li>
              <li>
                <strong>Google Maps / Leaflet / CARTO</strong> — map tiles and
                location display on our Locations page. These providers may
                collect anonymised usage data.
              </li>
            </ul>
            <p>
              Each third-party service operates under its own privacy policy. We
              encourage you to review those policies directly.
            </p>

            <h2>5. Data Retention</h2>
            <p>
              We retain personal data only for as long as necessary to fulfil the
              purposes described above. Order and booking records are kept for up
              to six years to satisfy accounting and legal requirements. Contact
              form messages are deleted within 12 months of resolution.
            </p>

            <h2>6. Your Rights</h2>
            <p>
              Under the UK General Data Protection Regulation (UK GDPR), you
              have the right to:
            </p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Request data portability</li>
              <li>
                Withdraw consent at any time, where processing is based on
                consent
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at the address
              below.
            </p>

            <h2>7. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy or wish to
              exercise your data rights, please contact us at:
            </p>
            <p>
              <strong>The Hot Sausage Company</strong>
              <br />
              Email:{" "}
              <a
                href="mailto:Joseph.Board@hotsausagecompany.com"
                className="text-brand-maroon underline"
              >
                Joseph.Board@hotsausagecompany.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
