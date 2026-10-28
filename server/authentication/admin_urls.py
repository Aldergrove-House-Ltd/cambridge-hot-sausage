from django.urls import include, path
from rest_framework.routers import DefaultRouter

from shop.views import AdminProductViewSet, AdminCategoryViewSet, AdminReviewViewSet, AdminVariantViewSet, AdminImageViewSet
from orders.views import AdminOrderViewSet, RefundOrderView
from events.views import AdminBookingViewSet, AdminBlockedDateViewSet, AdminEventConfigView, AdminTimeSlotViewSet
from events.views.refund_booking import RefundBookingView, BookingReceiptView
from contact.views import AdminContactMessageViewSet
from newsletter.views import AdminSubscriberViewSet

router = DefaultRouter(trailing_slash=False)
router.register("products", AdminProductViewSet, basename="admin-product")
router.register("variants", AdminVariantViewSet, basename="admin-variant")
router.register("images", AdminImageViewSet, basename="admin-image")
router.register("categories", AdminCategoryViewSet, basename="admin-category")
router.register("reviews", AdminReviewViewSet, basename="admin-review")
router.register("orders", AdminOrderViewSet, basename="admin-order")
router.register("bookings", AdminBookingViewSet, basename="admin-booking")
router.register("blocked-dates", AdminBlockedDateViewSet, basename="admin-blocked-date")
router.register("time-slots", AdminTimeSlotViewSet, basename="admin-time-slot")
router.register("messages", AdminContactMessageViewSet, basename="admin-message")
router.register("subscribers", AdminSubscriberViewSet, basename="admin-subscriber")

urlpatterns = [
    path("", include(router.urls)),
    path("event-config", AdminEventConfigView.as_view(), name="admin-event-config"),
    path("orders/<uuid:pk>/refund", RefundOrderView.as_view(), name="admin-order-refund"),
    path("bookings/<uuid:pk>/refund", RefundBookingView.as_view(), name="admin-booking-refund"),
    path("bookings/<uuid:pk>/receipt", BookingReceiptView.as_view(), name="admin-booking-receipt"),
]
