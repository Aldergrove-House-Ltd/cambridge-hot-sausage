from django.db.models import Count, Q, Sum
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from contact.models import ContactMessage
from events.models import EventBooking
from newsletter.models import Subscriber
from orders.models import Order


class DashboardView(APIView):
    """
    GET /api/v1/auth/dashboard

    Aggregated metrics for the admin dashboard.
    """

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        order_stats = Order.objects.aggregate(
            total_orders=Count("id"),
            orders_revenue=Sum("total", filter=Q(status=Order.Status.PAID)),
        )

        booking_stats = EventBooking.objects.aggregate(
            pending=Count("id", filter=Q(status=EventBooking.Status.HELD)),
            confirmed=Count("id", filter=Q(status=EventBooking.Status.CONFIRMED)),
            bookings_revenue=Sum("price", filter=Q(status=EventBooking.Status.CONFIRMED)),
        )

        total_revenue = float(order_stats["orders_revenue"] or 0) + float(
            booking_stats["bookings_revenue"] or 0
        )

        unread_messages = ContactMessage.objects.filter(
            status=ContactMessage.Status.NEW,
        ).count()
        subscriber_count = Subscriber.objects.filter(is_active=True).count()

        recent_orders = list(
            Order.objects.order_by("-created_at").values(
                "id", "customer_name", "customer_email", "status", "total", "created_at",
            )[:5]
        )
        recent_bookings = list(
            EventBooking.objects.filter(
                status__in=[EventBooking.Status.HELD, EventBooking.Status.CONFIRMED],
            )
            .order_by("-created_at")
            .values(
                "id", "date", "customer_name", "status", "price", "num_guests", "created_at",
            )[:5]
        )

        return Response({
            "total_orders": order_stats["total_orders"] or 0,
            "total_revenue": total_revenue,
            "pending_bookings": booking_stats["pending"] or 0,
            "confirmed_bookings": booking_stats["confirmed"] or 0,
            "unread_messages": unread_messages,
            "subscriber_count": subscriber_count,
            "recent_orders": recent_orders,
            "recent_bookings": recent_bookings,
        })
