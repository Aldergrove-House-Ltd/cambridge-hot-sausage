from django.contrib import admin

from .models import GooglePlacesUsage


@admin.register(GooglePlacesUsage)
class GooglePlacesUsageAdmin(admin.ModelAdmin):
    """Read-only view of how many billed Google calls each month used."""

    list_display = ("month", "calls", "updated_at")
    readonly_fields = ("month", "calls", "updated_at")

    def has_add_permission(self, request):
        return False
