/**
 * A Google review as served by the backend (`GET /api/v1/reviews/google/`),
 * which maps Places API (New) reviews onto this shape and keeps only 4★/5★.
 */
export interface Review {
  /** Display name of the review author. */
  author_name: string;

  /** URL to the author's Google Maps profile. */
  author_url: string;

  /** Language code of `text` — the reviewer's original wording. */
  language: string;

  /** URL of the author's Google profile photo (may be empty). */
  profile_photo_url: string;

  /** Star rating, 4 or 5 (lower ratings are filtered out server-side). */
  rating: number;

  /** Relative time in the page's locale, e.g. "3 months ago" (computed at render). */
  relative_time_description: string;

  /** Full review body. */
  text: string;

  /** Unix epoch timestamp (seconds) when the review was published. */
  time: number;

  /** Link to this review on Google Maps. */
  review_url: string;
}

/** The Google listing's overall rating and links. */
export interface ReviewSummary {
  /** False when Google couldn't be reached — the page links out instead. */
  available: boolean;

  /** Average rating across all Google ratings, e.g. 4.4. */
  averageRating: number | null;

  /** Total number of Google ratings. */
  totalRatings: number | null;

  /** The listing on Google Maps (all reviews). */
  googleMapsUrl: string;

  /** Google's "write a review" page for the listing. */
  writeReviewUrl: string;
}
