from django.db.models import Count
from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from orders.models import Order
from orders.serializers import AdminOrderListSerializer, AdminOrderDetailSerializer, AdminOrderStatusSerializer


class AdminOrderViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]
    http_method_names = ["get", "patch"]

    def get_queryset(self):
        if self.action == "list":
            # Annotate item_count so the list serializer doesn't issue
            # a SELECT COUNT per row.
            return Order.objects.annotate(item_count=Count("items")).order_by("-created_at")
        return Order.objects.prefetch_related("items").order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "list":
            return AdminOrderListSerializer
        if self.action == "partial_update":
            return AdminOrderStatusSerializer
        return AdminOrderDetailSerializer

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        if order.status == Order.Status.CANCELLED:
            return Response(
                {"error": "Cannot change status of a refunded/cancelled order."},
                status=409,
            )
        return super().partial_update(request, *args, **kwargs)
