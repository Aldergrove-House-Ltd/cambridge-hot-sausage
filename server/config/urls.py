from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/shop/", include("shop.urls")),
    path("api/v1/orders/", include("orders.urls")),
    path("api/v1/contact", include("contact.urls")),
    path("api/v1/newsletter/", include("newsletter.urls")),
    path("api/v1/events/", include("events.urls")),
    path("api/v1/auth/", include("authentication.urls")),
    path("api/v1/admin/", include("authentication.admin_urls")),
    # Django's static() helper is a no-op when DEBUG=False, so register serve
    # directly. Fine for low-traffic; swap to S3 (BUCKET_ENDPOINT) later.
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
