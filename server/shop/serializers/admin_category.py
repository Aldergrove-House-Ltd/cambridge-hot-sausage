from rest_framework import serializers
from shop.models import Category


class AdminCategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "image", "parent", "is_active", "order", "children", "product_count")

    def get_children(self, obj):
        return AdminCategorySerializer(obj.get_children(), many=True).data

    def get_product_count(self, obj):
        from shop.models import Product
        descendant_ids = obj.get_descendants(include_self=True).values("id")
        return (
            Product.objects
            .filter(categories__in=descendant_ids)
            .distinct()
            .count()
        )


class AdminCategoryWriteSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "image", "parent", "is_active", "order")
        read_only_fields = ("id",)
