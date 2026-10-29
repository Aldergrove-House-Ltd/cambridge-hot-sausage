from rest_framework import serializers

from shop.models import Category


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "image",
            "parent",
            "children",
            "product_count",
        )

    def get_children(self, obj):
        # Prefer the in-memory tree cached by MPTT's get_cached_trees (set
        # in CategoryViewSet.get_queryset) — avoids N+1 at scale.
        cached = getattr(obj, "_cached_children", None)
        if cached is not None:
            active = [c for c in cached if c.is_active]
        else:
            active = obj.get_children().filter(is_active=True)
        return CategorySerializer(active, many=True, context=self.context).data

    def get_product_count(self, obj):
        # Count products in this category AND all descendant categories so
        # a parent like "Drinks" reflects its entire subtree. MPTT's lft/rght
        # range makes this a single indexed scan.
        from shop.models import Product
        descendant_ids = obj.get_descendants(include_self=True).values("id")
        return (
            Product.objects
            .filter(is_active=True, categories__in=descendant_ids)
            .distinct()
            .count()
        )


class CategoryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for flat category lists (e.g. filter dropdowns)."""

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "image")
