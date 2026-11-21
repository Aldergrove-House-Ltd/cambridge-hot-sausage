/**
 * Server-side fetcher for the reviews page. The backend talks to Google
 * (keeping the API key server-side), filters to 4★/5★ and caches the result.
 */

import { getFormatter } from "next-intl/server";
import type { Review, ReviewSummary } from "@/types/review";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:8000";

interface GoogleReviewsResponse {
  available: boolean;
  rating: number | null;
  total: number | null;
  google_maps_uri: string;
  write_review_uri: string;
  // Dates come as epoch seconds; the relative "3 months ago" is localised here.
  reviews: Omit<Review, "relative_time_description">[];
}

export interface GoogleReviews {
  reviews: Review[];
  summary: ReviewSummary;
}

// Used only when the backend itself is unreachable (e.g. during a Docker
// build) — the page still links to the Fitzroy Street listing on Google.
const FALLBACK_PLACE_ID = "ChIJq5PzhJFw2EcRee37KSu0yDI";
const UNAVAILABLE: GoogleReviews = {
  reviews: [],
  summary: {
    available: false,
    averageRating: null,
    totalRatings: null,
    googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${FALLBACK_PLACE_ID}`,
    writeReviewUrl: `https://search.google.com/local/writereview?placeid=${FALLBACK_PLACE_ID}`,
  },
};

export async function getGoogleReviews(locale: string): Promise<GoogleReviews> {
  try {
    // One shared, language-independent payload: the backend calls Google at
    // most once per cache period whatever the locale or traffic.
    const res = await fetch(`${INTERNAL_API_URL}/api/v1/reviews/google/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as GoogleReviewsResponse;
    const format = await getFormatter({ locale });
    const now = new Date();
    return {
      reviews: data.reviews.map((review) => ({
        ...review,
        relative_time_description: review.time
          ? format.relativeTime(new Date(review.time * 1000), now)
          : "",
      })),
      summary: {
        available: data.available,
        averageRating: data.rating,
        totalRatings: data.total,
        googleMapsUrl: data.google_maps_uri,
        writeReviewUrl: data.write_review_uri,
      },
    };
  } catch {
    return UNAVAILABLE;
  }
}
