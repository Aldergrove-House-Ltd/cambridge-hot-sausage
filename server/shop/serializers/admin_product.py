from rest_framework import serializers
from shop.models import Product, ProductVariant, ProductImage, Category


class AdminVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ("id", "name", "sku", "price", "compare_at_price", "stock", "is_active", "order")
        read_only_fields = ("id", "sku")


class AdminImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "is_primary", "order")
        read_only_fields = ("id",)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # DRF's ImageField absolutises against the request Host, but
        # Next.js rewrites rewrite Host to the internal docker name
        # (backend:8000) which the browser can't resolve. Return the
        # relative /media/... path (or pass through absolute S3/Cloudinary).
        if instance.image:
            url = instance.image.url
            data["image"] = url
        return data


class AdminProductListSerializer(serializers.ModelSerializer):
    variant_count = serializers.IntegerField(read_only=True)
    category_names = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ("id", "name", "slug", "is_active", "is_featured", "variant_count", "category_names", "created_at")

    def get_category_names(self, obj):
        # Read from the prefetched M2M cache — no extra query.
        return [c.name for c in obj.categories.all()]


class AdminProductWriteSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = ("id", "name", "slug", "description", "categories", "is_active", "is_featured")
        read_only_fields = ("id",)


class AdminProductDetailSerializer(serializers.ModelSerializer):
    variants = AdminVariantSerializer(many=True, read_only=True)
    images = AdminImageSerializer(many=True, read_only=True)
    categories = serializers.PrimaryKeyRelatedField(many=True, queryset=Category.objects.all())

    class Meta:
        model = Product
        fields = ("id", "name", "slug", "description", "categories", "is_active", "is_featured", "variants", "images", "created_at", "updated_at")
