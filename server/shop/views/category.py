from django.core.cache import cache
from mptt.utils import get_cached_trees
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from shop.cache_versions import get_categories_version
from shop.models import Category
from shop.serializers import CategorySerializer

CACHE_TTL = 60 * 15  # 15 minutes


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only endpoint for the category tree.
    Only root-level active categories are returned at the top level;
    children are nested via the serializer.

    Both list and retrieve use version-keyed caching — invalidation is
    O(1) via cache.incr in the model signals.
    """

    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        # Standard QuerySet used by retrieve + DRF plumbing. list() builds
        # the hydrated tree separately below.
        return (
            Category.objects
            .filter(is_active=True, parent__isnull=True)
            .select_related("parent")
        )

    def list(self, request, *args, **kwargs):
        version = get_categories_version()
        cache_key = f"shop:v{version}:categories:list:{request.get_full_path()}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        # Load the full active tree in ONE query and hydrate children in
        # memory via MPTT's get_cached_trees — recursive serialization
        # becomes O(1) queries instead of O(N).
        all_active = (
            Category.objects
            .filter(is_active=True)
            .select_related("parent")
            .order_by("tree_id", "lft")
        )
        roots = get_cached_trees(all_active)
        results = self.get_serializer(roots, many=True).data
        # Match DRF's PageNumberPagination envelope so the frontend's
        # existing `data.results` consumer keeps working.
        data = {
            "count": len(results),
            "next": None,
            "previous": None,
            "results": results,
        }
        cache.set(cache_key, data, CACHE_TTL)
        return Response(data)

    def retrieve(self, request, *args, **kwargs):
        version = get_categories_version()
        cache_key = f"shop:v{version}:category_detail:{kwargs.get(self.lookup_field, '')}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().retrieve(request, *args, **kwargs)
        if response.status_code == 200:
            cache.set(cache_key, response.data, CACHE_TTL)
        return response
