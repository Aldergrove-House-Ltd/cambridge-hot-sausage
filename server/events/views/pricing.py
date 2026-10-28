from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import EventConfig
from events.serializers import CalculatePriceSerializer, EventConfigSerializer
from events.services.geo import distance_from_cambridge, validate_location


class EventConfigView(APIView):
    """
    GET /api/v1/events/config

    Returns pricing configuration for the frontend
    (bands, limits, radius).
    """

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        config = EventConfig.load()
        return Response(EventConfigSerializer(config).data)


class CalculatePriceView(APIView):
    """
    POST /api/v1/events/calculate-price

    Given lat/lng, validates the location and returns
    the price breakdown.
    """

    # Public endpoint — skip DRF session auth so admin cookies in the
    # same browser do not trigger CSRF on this anonymous flow.
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CalculatePriceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        lat = serializer.validated_data["lat"]
        lng = serializer.validated_data["lng"]
        config = EventConfig.load()

        # Validate location (radius + land check)
        geo = validate_location(lat, lng, config.max_radius_miles)
        if not geo.valid:
            return Response({"error": geo.error}, status=400)

        distance = distance_from_cambridge(lat, lng)
        band_label, surcharge = config.calculate_surcharge(distance)
        total = float(config.base_price) + surcharge

        return Response({
            "distance_miles": round(distance, 1),
            "address": geo.address,
            "base_price": float(config.base_price),
            "band_label": band_label,
            "surcharge": surcharge,
            "total_price": total,
        })
