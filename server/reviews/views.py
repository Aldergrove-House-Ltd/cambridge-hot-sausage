from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .google import get_google_reviews


@method_decorator(cache_control(public=True, max_age=300), name="get")
class GoogleReviewsView(APIView):
    """GET /api/v1/reviews/google/ — rating + 4★/5★ Google reviews.

    Read-only and public (the reviews are public on Google anyway). Requests
    are served from a shared cache and take no parameters, so however much
    traffic arrives, Google is called at most once per cache period. The
    throttle only stops anyone hammering this server itself.
    """

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "google_reviews"

    def get(self, request):
        return Response(get_google_reviews())
