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
    title: "Terms of Service",
    description:
      "Terms and conditions governing the use of The Hot Sausage Company's website, online shop and event booking service.",
    path: "/legal/terms",
    locale,
  });
}

export default async function TermsPage({
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
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-brand-ink/40">
            Last updated: April 2026
          </p>

          <div className="prose prose-sm mt-8 max-w-none text-brand-ink/70">
            <h2>1. Acceptance</h2>
            <p>
              By accessing or using The Hot Sausage Company's website
              (www.hotsausagecompany.com), you agree to be bound by these Terms
              of Service. If you do not agree, please do not use our website or
              services.
            </p>

            <h2>2. Services</h2>
            <p>
              The Hot Sausage Company operates an online shop for purchasing food
              products and an event booking service for private catering. All
              services described on this website are subject to availability.
            </p>

            <h2>3. Orders &amp; Payment</h2>
            <p>
              All prices are displayed in British Pounds (GBP) and include VAT
              where applicable. Payment is processed securely through Stripe. By
              placing an order, you confirm that the payment details provided are
              valid and that you are authorised to use them.
            </p>
            <p>
              An order confirmation does not constitute acceptance. We reserve
              the right to decline or cancel any order for reasons including
              stock availability, pricing errors, or suspected fraud.
            </p>

            <h2>4. Event Bookings</h2>
            <p>
              Event bookings are for single-day events only. A non-refundable
              deposit is required at the time of booking to secure the date.
            </p>
            <p>
              <strong>Cancellation policy:</strong>
            </p>
            <ul>
              <li>
                Cancellations made more than 30 days before the event date are
                eligible for a full refund minus the deposit.
              </li>
              <li>
                Cancellations made between 14 and 30 days before the event date
                are eligible for a 50% refund minus the deposit.
              </li>
              <li>
                Cancellations made fewer than 14 days before the event date are
                non-refundable.
              </li>
            </ul>
            <p>
              <strong>Holds:</strong> A date may be held without payment for up
              to 48 hours. After that period, the hold is automatically released.
            </p>
            <p>
              Pricing is calculated based on the distance from Cambridge city
              centre. Locations further from Cambridge may incur additional
              travel charges.
            </p>

            <h2>5. Delivery</h2>
            <p>
              Delivery options and estimated timescales are displayed at
              checkout. The Hot Sausage Company is not responsible for delays
              caused by third-party carriers or circumstances beyond our control.
            </p>

            <h2>6. Returns</h2>
            <p>
              Due to the perishable nature of our products, returns are generally
              not accepted. If you receive a damaged or incorrect item, please
              contact us within 24 hours of delivery and we will arrange a
              replacement or refund at our discretion.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              All content on this website — including text, images, logos, and
              design — is the property of The Hot Sausage Company and is protected
              by copyright and intellectual property laws. You may not reproduce,
              distribute, or create derivative works from any content without our
              prior written permission.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, The Hot Sausage Company
              shall not be liable for any indirect, incidental, or consequential
              damages arising from the use of our website or services. Our total
              liability for any claim shall not exceed the amount paid by you for
              the specific product or service giving rise to the claim.
            </p>

            <h2>9. Governing Law</h2>
            <p>
              These Terms of Service are governed by and construed in accordance
              with the laws of England and Wales. Any disputes shall be subject
              to the exclusive jurisdiction of the courts of England and Wales.
            </p>

            <h2>10. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
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
