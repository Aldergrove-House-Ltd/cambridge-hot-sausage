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
    title: "Cookie Policy",
    description:
      "The Hot Sausage Company uses only essential cookies. Full list of what we set and why.",
    path: "/legal/cookies",
    locale,
  });
}

export default async function CookiesPage({
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
            Cookie Policy
          </h1>
          <p className="mt-2 text-sm text-brand-ink/40">
            Last updated: April 2026
          </p>

          <div className="prose prose-sm mt-8 max-w-none text-brand-ink/70">
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit a
              website. They help the website function correctly, remember your
              preferences, and improve your overall experience.
            </p>

            <h2>2. Cookies We Use</h2>

            <h3>Essential Cookies</h3>
            <p>
              These cookies are strictly necessary for the website to operate.
              They cannot be disabled.
            </p>
            <ul>
              <li>
                <strong>Session cookie</strong> — maintains your browsing session
                and keeps your cart contents while you navigate the site.
              </li>
              <li>
                <strong>CSRF token</strong> — protects against cross-site request
                forgery attacks when submitting forms.
              </li>
            </ul>

            <h3>Analytics Cookies</h3>
            <p>
              We do not currently use any analytics or tracking cookies. Should
              this change in the future, we will update this policy and request
              your consent before setting any such cookies.
            </p>

            <h3>Third-Party Cookies</h3>
            <p>
              Certain third-party services integrated into our website may set
              their own cookies:
            </p>
            <ul>
              <li>
                <strong>Stripe</strong> — our payment processor may set cookies
                to facilitate secure transactions and detect fraud. These cookies
                are governed by Stripe&apos;s own cookie and privacy policies.
              </li>
              <li>
                <strong>Leaflet / CARTO</strong> — our mapping providers may set
                cookies or use local storage when rendering interactive maps on
                our Locations page. These are governed by the respective
                provider&apos;s policies.
              </li>
            </ul>

            <h2>3. Managing Cookies</h2>
            <p>
              You can control and delete cookies through your browser settings.
              Most browsers allow you to:
            </p>
            <ul>
              <li>View which cookies are stored on your device</li>
              <li>Delete individual cookies or all cookies at once</li>
              <li>Block cookies from specific or all websites</li>
              <li>Set preferences for first-party and third-party cookies</li>
            </ul>
            <p>
              Please note that disabling essential cookies may prevent certain
              features of the website from functioning correctly, such as
              maintaining your shopping cart or processing payments.
            </p>

            <h2>4. Contact</h2>
            <p>
              If you have any questions about our use of cookies, please contact
              us at:
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
