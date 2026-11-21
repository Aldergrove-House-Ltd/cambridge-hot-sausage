from django.db import models


class GooglePlacesUsage(models.Model):
    """Billed Places API (Place Details) calls per calendar month (UTC).

    Backs the hard GOOGLE_PLACES_MONTHLY_CAP. It lives in the database so app
    restarts and cache flushes can't reset the count. Only the count is
    stored — never any review content.
    """

    month = models.CharField(max_length=7, unique=True, help_text="YYYY-MM (UTC)")
    calls = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-month"]
        verbose_name = "Google Places usage"
        verbose_name_plural = "Google Places usage"

    def __str__(self):
        return f"{self.month}: {self.calls} calls"
