import secrets
from datetime import timedelta

from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from events.models import EventBooking, EventConfig, TimeSlot
from events.serializers import HoldDateSerializer


class HoldThrottle(AnonRateThrottle):
    """Tight rate-limit to stop calendar-locking attacks."""

    rate = "5/min"
    scope = "events_hold"


@method_decorator(csrf_exempt, name="dispatch")
class HoldDateView(APIView):
    """
    POST /api/v1/events/hold

    Hold a specific time slot on a date. The server generates the
    hold_token — clients must never supply one (prevents token
    enumeration and inventory-locking abuse).
    """

    # Public endpoint — explicitly disable DRF session auth so an admin
    # session cookie in the same browser does not trigger CSRF enforcement
    # on this anonymous booking flow.
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [HoldThrottle]

    def post(self, request):
        serializer = HoldDateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        event_date = serializer.validated_data["date"]
        time_slot_id = serializer.validated_data["time_slot_id"]

        try:
            time_slot = TimeSlot.objects.get(id=time_slot_id, is_active=True)
        except TimeSlot.DoesNotExist:
            return Response({"error": "Invalid time slot."}, status=400)

        if not EventBooking.is_slot_available(event_date, time_slot_id):
            return Response(
                {"error": "This time slot is no longer available."},
                status=409,
            )

        config = EventConfig.load()
        expires_at = timezone.now() + timedelta(minutes=config.hold_duration_minutes)
        hold_token = secrets.token_urlsafe(32)

        booking = EventBooking.objects.create(
            date=event_date,
            time_slot=time_slot,
            status=EventBooking.Status.HELD,
            hold_token=hold_token,
            hold_expires_at=expires_at,
            timing_start=time_slot.start_time,
            timing_end=time_slot.end_time,
        )

        return Response({
            "id": str(booking.id),
            "date": booking.date.isoformat(),
            "time_slot": {
                "id": time_slot.id,
                "label": time_slot.label,
                "start_time": time_slot.start_time.strftime("%H:%M"),
                "end_time": time_slot.end_time.strftime("%H:%M"),
            },
            "hold_token": booking.hold_token,
            "expires_at": booking.hold_expires_at.isoformat(),
            "hold_minutes": config.hold_duration_minutes,
        }, status=201)


@method_decorator(csrf_exempt, name="dispatch")
class ReleaseHoldView(APIView):
    """DELETE /api/v1/events/hold — Release a held slot."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def delete(self, request):
        hold_token = request.query_params.get("hold_token")
        if not hold_token:
            return Response({"error": "hold_token required"}, status=400)

        deleted, _ = EventBooking.objects.filter(
            hold_token=hold_token,
            status=EventBooking.Status.HELD,
        ).delete()

        return Response({"released": deleted > 0})
