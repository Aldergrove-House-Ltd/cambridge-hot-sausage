import stripe
from django.conf import settings
from django.db import transaction
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import EventBooking

stripe.api_key = settings.STRIPE_SECRET_KEY


class RefundBookingView(APIView):
    """
    POST /api/v1/admin/bookings/<id>/refund

    Refunds a confirmed booking via Stripe. Mirrors the Order refund
    pattern — requires { "confirm": true } in the body.
    """

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        if not request.data.get("confirm"):
            return Response(
                {"error": "Send { \"confirm\": true } to proceed with refund."},
                status=400,
            )

        with transaction.atomic():
            try:
                booking = EventBooking.objects.select_for_update().get(pk=pk)
            except EventBooking.DoesNotExist:
                return Response({"error": "Booking not found."}, status=404)

            if booking.status == EventBooking.Status.CANCELLED:
                return Response({"error": "Booking is already cancelled/refunded."}, status=400)

            if not booking.stripe_session_id:
                return Response({"error": "No Stripe session found for this booking."}, status=400)

            try:
                session = stripe.checkout.Session.retrieve(booking.stripe_session_id)
                payment_intent = session.payment_intent
                if not payment_intent:
                    return Response({"error": "No payment intent on the Stripe session."}, status=400)
                refund = stripe.Refund.create(
                    payment_intent=payment_intent,
                    idempotency_key=f"refund:booking:{booking.id}",
                )
            except stripe.error.StripeError as e:
                return Response({"error": f"Stripe error: {str(e)}"}, status=400)

            booking.status = EventBooking.Status.CANCELLED
            booking.save(update_fields=["status", "updated_at"])

        return Response({
            "detail": "Booking refunded successfully.",
            "refund_id": refund.id,
            "refund_status": refund.status,
            "amount_refunded": refund.amount / 100,
        })


class BookingReceiptView(APIView):
    """
    GET /api/v1/admin/bookings/<id>/receipt

    Returns the Stripe-hosted receipt URL for a confirmed booking.
    Kept separate so admin list queries do not have to hit Stripe.
    """

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            booking = EventBooking.objects.get(pk=pk)
        except EventBooking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=404)

        if not booking.stripe_session_id:
            return Response({"receipt_url": ""})

        try:
            session = stripe.checkout.Session.retrieve(
                booking.stripe_session_id,
                expand=["payment_intent.latest_charge"],
            )
        except stripe.error.StripeError:
            return Response({"receipt_url": ""})

        receipt_url = ""
        pi = session.payment_intent
        if pi and hasattr(pi, "latest_charge") and pi.latest_charge:
            receipt_url = getattr(pi.latest_charge, "receipt_url", "") or ""

        return Response({"receipt_url": receipt_url})
