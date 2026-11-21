from unittest import mock

import requests
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone

from .google import calls_this_month, get_google_reviews
from .models import GooglePlacesUsage

PLACE = "place123"
FRESH_KEY = f"google-reviews:{PLACE}:fresh"
LOCK_KEY = f"google-reviews:{PLACE}:lock"


def _review(rating, text="Lovely hot dog", when="2026-08-10T08:46:49.552199351Z", name="A. Customer", original=None):
    review = {
        "rating": rating,
        "text": {"text": text, "languageCode": "en"},
        "publishTime": when,
        "authorAttribution": {"displayName": name, "uri": "https://maps.google.com/u", "photoUri": "https://lh3/p"},
        "googleMapsUri": "https://maps.google.com/review",
    }
    if original:
        review["originalText"] = original
    return review


PAYLOAD = {"rating": 4.4, "userRatingCount": 25, "googleMapsUri": "https://maps.google.com/?cid=1", "reviews": [_review(5)]}


def _ok(payload=PAYLOAD):
    response = mock.Mock()
    response.json.return_value = payload
    response.raise_for_status.return_value = None
    return response


@override_settings(
    GOOGLE_PLACES_API_KEY="test-key",
    GOOGLE_PLACE_ID=PLACE,
    GOOGLE_REVIEWS_CACHE_SECONDS=60,
    GOOGLE_REVIEWS_STALE_SECONDS=600,
    GOOGLE_PLACES_MONTHLY_CAP=5,
)
class GoogleReviewsTests(TestCase):
    def setUp(self):
        cache.clear()

    @mock.patch("reviews.google.requests.get")
    def test_keeps_four_and_five_star_reviews_with_text_newest_first(self, get):
        get.return_value = _ok({
            **PAYLOAD,
            "reviews": [
                _review(5, name="Older five", when="2025-01-01T00:00:00Z"),
                _review(3, name="Three"),
                _review(4, name="Newer four", when="2026-06-01T00:00:00Z"),
                _review(5, text="   ", name="No text"),
                _review(5, name="Translated", when="2024-01-01T00:00:00Z", text="Very good",
                        original={"text": "Sehr gut", "languageCode": "de"}),
            ],
        })

        result = get_google_reviews()

        self.assertTrue(result["available"])
        self.assertEqual((result["rating"], result["total"]), (4.4, 25))
        self.assertEqual([r["author_name"] for r in result["reviews"]], ["Newer four", "Older five", "Translated"])
        # The reviewer's own words win over Google's translation.
        self.assertEqual((result["reviews"][2]["text"], result["reviews"][2]["language"]), ("Sehr gut", "de"))
        self.assertIn("placeid=place123", result["write_review_uri"])
        # The API key travels in a header, never in the URL.
        self.assertEqual(get.call_args.kwargs["headers"]["X-Goog-Api-Key"], "test-key")
        self.assertNotIn("test-key", get.call_args.args[0])

    @mock.patch("reviews.google.requests.get")
    def test_calls_google_once_per_cache_period_and_counts_it(self, get):
        get.return_value = _ok()

        for _ in range(10):
            get_google_reviews()

        self.assertEqual(get.call_count, 1)
        self.assertEqual(calls_this_month(), 1)

    @mock.patch("reviews.google.requests.get")
    def test_serves_last_good_result_and_backs_off_when_google_fails(self, get):
        get.return_value = _ok()
        good = get_google_reviews()
        cache.delete(FRESH_KEY)  # the cache period ends…
        get.side_effect = requests.ConnectionError("down")  # …and Google is down

        self.assertEqual(get_google_reviews(), good)  # tries once, serves last good
        self.assertEqual(get_google_reviews(), good)  # backing off: no retry
        self.assertEqual(get.call_count, 2)

    @mock.patch("reviews.google.requests.get")
    def test_monthly_cap_stops_calls(self, get):
        GooglePlacesUsage.objects.create(month=timezone.now().strftime("%Y-%m"), calls=5)

        result = get_google_reviews()

        self.assertFalse(result["available"])
        get.assert_not_called()

    @mock.patch("reviews.google.requests.get")
    def test_only_one_request_refreshes_at_a_time(self, get):
        cache.add(LOCK_KEY, True, 30)  # another worker is mid-refresh

        result = get_google_reviews()

        self.assertFalse(result["available"])
        get.assert_not_called()

    @override_settings(GOOGLE_PLACES_API_KEY="")
    @mock.patch("reviews.google.requests.get")
    def test_missing_key_never_calls_google(self, get):
        result = get_google_reviews()

        self.assertFalse(result["available"])
        self.assertIn("place_id:place123", result["google_maps_uri"])
        get.assert_not_called()
        self.assertEqual(calls_this_month(), 0)


@override_settings(GOOGLE_PLACES_API_KEY="", GOOGLE_PLACE_ID=PLACE)
class GoogleReviewsEndpointTests(TestCase):
    def setUp(self):
        cache.clear()

    def test_get_is_public_and_cacheable(self):
        response = self.client.get("/api/v1/reviews/google/")

        self.assertEqual(response.status_code, 200)
        self.assertIn("public", response["Cache-Control"])
        self.assertIn("max-age=300", response["Cache-Control"])

    def test_query_params_cannot_trigger_a_refresh(self):
        with mock.patch("reviews.views.get_google_reviews", return_value={}) as service:
            self.client.get("/api/v1/reviews/google/?lang=de&refresh=1&nocache=1")

        service.assert_called_once_with()

    def test_writes_are_not_allowed(self):
        for method in ("post", "put", "patch", "delete"):
            response = getattr(self.client, method)("/api/v1/reviews/google/")
            self.assertEqual(response.status_code, 405, method)


class GoogleReviewsThrottleTests(TestCase):
    def setUp(self):
        cache.clear()

    @override_settings(GOOGLE_PLACES_API_KEY="", GOOGLE_PLACE_ID=PLACE)
    def test_rate_limited_per_client(self):
        from rest_framework.throttling import ScopedRateThrottle

        with mock.patch.object(ScopedRateThrottle, "THROTTLE_RATES", {"google_reviews": "2/min"}):
            codes = [self.client.get("/api/v1/reviews/google/").status_code for _ in range(3)]

        self.assertEqual(codes, [200, 200, 429])
