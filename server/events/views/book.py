import secrets
from urllib.parse import quote

import stripe
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import EventBooking, EventConfig
from events.serializers import ConfirmBookingSerializer
from events.services.geo import distance_from_cambridge, validate_location
from orders.views.checkout import BUYER_COOKIE_MAX_AGE, BUYER_COOKIE_NAME

stripe.api_key = settings.STRIPE_SECRET_KEY


class ConfirmBookingView(APIView):
    """
    POST /api/v1/events/book

    Confirm a held booking — validates location, calculates price,
    updates the booking record, creates a Stripe Checkout session.
    """

    # Public endpoint — skip DRF session auth so admin cookies in the
    # same browser do not trigger CSRF on this anonymous booking flow.
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ConfirmBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            booking = EventBooking.objects.get(
                hold_token=data["hold_token"],
                status=EventBooking.Status.HELD,
            )
        except EventBooking.DoesNotExist:
            return Response(
                {"error": "Hold expired or not found. Please select a date again."},
                status=409,
            )

        if booking.is_hold_expired:
            booking.delete()
            return Response(
                {"error": "Your hold has expired. Please select a date again."},
                status=409,
            )

        config = EventConfig.load()

        if data["num_guests"] < config.min_guests:
            return Response(
                {"error": f"Minimum {config.min_guests} guests required."},
                status=400,
            )
        if data["num_guests"] > config.max_guests:
            return Response(
                {"error": f"Maximum {config.max_guests} guests allowed."},
                status=400,
            )

        geo = validate_location(data["lat"], data["lng"], config.max_radius_miles)
        if not geo.valid:
            return Response({"error": geo.error}, status=400)

        distance = distance_from_cambridge(data["lat"], data["lng"])
        total_price = config.total_price(distance)

        booking.location_lat = data["lat"]
        booking.location_lng = data["lng"]
        booking.location_address = geo.address
        booking.distance_miles = round(distance, 1)
        booking.price = total_price
        booking.num_guests = data["num_guests"]
        booking.notes = data.get("notes", "")
        booking.customer_name = data["customer_name"]
        booking.customer_email = data["customer_email"]
        booking.customer_phone = data.get("customer_phone", "")

        # hold_token is server-generated (URL-safe), but quote() defensively
        # in case the format ever changes.
        safe_hold_token = quote(booking.hold_token, safe="")
        success_url = (
            settings.FRONTEND_URL
            + f"/events/success?session_id={{CHECKOUT_SESSION_ID}}&hold_token={safe_hold_token}"
        )

        buyer_id = secrets.token_urlsafe(32)

        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "gbp",
                    "unit_amount": int(total_price * 100),
                    "product_data": {
                        "name": f"Event Booking — {booking.date.isoformat()}",
                        "description": f"{data['num_guests']} guests · {geo.address[:100]}",
                    },
                },
                "quantity": 1,
            }],
            success_url=success_url,
            cancel_url=settings.FRONTEND_URL + "/events",
            metadata={
                "booking_id": str(booking.id),
                "hold_token": booking.hold_token,
                "type": "event_booking",
                "buyer_id": buyer_id,
            },
            customer_email=data["customer_email"],
        )

        booking.stripe_session_id = session.id
        booking.save(update_fields=[
            "location_lat", "location_lng", "location_address", "distance_miles",
            "price", "num_guests", "notes", "customer_name", "customer_email",
            "customer_phone", "stripe_session_id", "updated_at",
        ])

        response = Response({"url": session.url})
        response.set_cookie(
            BUYER_COOKIE_NAME,
            buyer_id,
            max_age=BUYER_COOKIE_MAX_AGE,
            httponly=True,
            samesite="Lax",
            secure=not settings.DEBUG,
            path="/",
        )
        return response
