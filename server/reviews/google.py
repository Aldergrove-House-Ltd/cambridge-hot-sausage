"""Google reviews for the business, via Places API (New) Place Details.

Place Details with reviews is a billed SKU (~1,000 free calls a month), so
usage is kept low and bounded:

- One shared cache entry for every visitor and language, refreshed at most
  once per GOOGLE_REVIEWS_CACHE_SECONDS (default 6 h, roughly 120 calls/month).
- A lock, so when that entry expires only one request calls Google.
- After a failure, a back-off window with no retries. Meanwhile visitors get
  the last good result, kept for GOOGLE_REVIEWS_STALE_SECONDS.
- A hard cap of GOOGLE_PLACES_MONTHLY_CAP calls per month, counted in the
  database so restarts and cache flushes can't reset it.

Nothing from the request (query string, headers) affects whether Google is
called, so traffic can't force extra calls. Google's terms don't allow
storing review content, so reviews only ever live in the cache, never in the
database (the database only holds the monthly call count).
"""

import logging
import time

import requests
from django.conf import settings
from django.core.cache import cache
from django.db.models import F
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from .models import GooglePlacesUsage

logger = logging.getLogger(__name__)

PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places/{place_id}"
FIELD_MASK = "rating,userRatingCount,googleMapsUri,reviews"
MIN_RATING = 4
REQUEST_TIMEOUT_SECONDS = 8
LOCK_SECONDS = 30
FAILURE_BACKOFF_SECONDS = 15 * 60


def _keys(place_id: str) -> dict:
    prefix = f"google-reviews:{place_id}"
    return {name: f"{prefix}:{name}" for name in ("fresh", "stale", "lock", "backoff")}


def _links(place_id: str, maps_uri: str | None = None) -> dict:
    return {
        "google_maps_uri": maps_uri or f"https://www.google.com/maps/place/?q=place_id:{place_id}",
        "write_review_uri": f"https://search.google.com/local/writereview?placeid={place_id}",
    }


def _unavailable(place_id: str) -> dict:
    return {
        "available": False,
        "rating": None,
        "total": None,
        "reviews": [],
        "fetched_at": None,
        **_links(place_id),
    }


def _current_month() -> str:
    return timezone.now().strftime("%Y-%m")


def calls_this_month() -> int:
    """Billed Place Details calls made so far this month (UTC)."""
    return (
        GooglePlacesUsage.objects.filter(month=_current_month())
        .values_list("calls", flat=True)
        .first()
        or 0
    )


def _record_call() -> None:
    usage, _ = GooglePlacesUsage.objects.get_or_create(month=_current_month())
    GooglePlacesUsage.objects.filter(pk=usage.pk).update(
        calls=F("calls") + 1, updated_at=timezone.now()
    )


def _normalise_review(raw: dict) -> dict:
    """Map a Places API (New) review onto the shape the frontend uses."""
    author = raw.get("authorAttribution") or {}
    # The reviewer's own words; `text` can be a Google translation.
    body = raw.get("originalText") or raw.get("text") or {}
    published = parse_datetime(raw.get("publishTime") or "")
    return {
        "author_name": author.get("displayName", ""),
        "author_url": author.get("uri", ""),
        "profile_photo_url": author.get("photoUri", ""),
        "rating": int(raw.get("rating") or 0),
        "text": (body.get("text") or "").strip(),
        "language": body.get("languageCode", ""),
        "time": int(published.timestamp()) if published else 0,
        "review_url": raw.get("googleMapsUri", ""),
    }


def _fetch(place_id: str) -> dict | None:
    """One billed call to Google. Returns None on any failure or refusal."""
    api_key = settings.GOOGLE_PLACES_API_KEY
    if not api_key or not place_id:
        logger.warning("Google reviews disabled: GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID is not set")
        return None

    cap = settings.GOOGLE_PLACES_MONTHLY_CAP
    if calls_this_month() >= cap:
        logger.warning("Google reviews: monthly cap of %s calls reached; serving cached data", cap)
        return None

    # Count the attempt up front: a timed-out request may still be billed.
    _record_call()
    try:
        response = requests.get(
            PLACE_DETAILS_URL.format(place_id=place_id),
            params={"languageCode": "en"},
            # The key goes in a header, so it never appears in URLs or logs.
            headers={"X-Goog-Api-Key": api_key, "X-Goog-FieldMask": FIELD_MASK},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json()
    except (requests.RequestException, ValueError) as exc:
        logger.warning("Google reviews request failed: %s", exc)
        return None

    reviews = [_normalise_review(raw) for raw in data.get("reviews", [])]
    reviews = [r for r in reviews if r["rating"] >= MIN_RATING and r["text"]]
    reviews.sort(key=lambda r: r["time"], reverse=True)

    return {
        "available": True,
        "rating": data.get("rating"),
        "total": data.get("userRatingCount"),
        "reviews": reviews,
        "fetched_at": int(time.time()),
        **_links(place_id, data.get("googleMapsUri")),
    }


def get_google_reviews() -> dict:
    """The listing's rating plus its 4★/5★ reviews, from the shared cache.

    Always returns the same shape. ``available`` is False only when Google
    has never been reached recently (no key, failure, or cap) and there's no
    last-good result to fall back on.
    """
    place_id = settings.GOOGLE_PLACE_ID
    keys = _keys(place_id)

    fresh = cache.get(keys["fresh"])
    if fresh is not None:
        return fresh

    fallback = cache.get(keys["stale"]) or _unavailable(place_id)

    # Don't retry during a back-off window, and let only one request refresh.
    if cache.get(keys["backoff"]) or not cache.add(keys["lock"], True, LOCK_SECONDS):
        return fallback

    try:
        result = _fetch(place_id)
    finally:
        cache.delete(keys["lock"])

    if result is None:
        cache.set(keys["backoff"], True, FAILURE_BACKOFF_SECONDS)
        return fallback

    cache.set(keys["fresh"], result, settings.GOOGLE_REVIEWS_CACHE_SECONDS)
    cache.set(keys["stale"], result, settings.GOOGLE_REVIEWS_STALE_SECONDS)
    return result
