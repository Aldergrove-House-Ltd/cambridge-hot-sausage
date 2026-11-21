from django.urls import path

from .views import GoogleReviewsView

urlpatterns = [
    path("google/", GoogleReviewsView.as_view(), name="google-reviews"),
]
