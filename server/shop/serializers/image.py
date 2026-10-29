from rest_framework import serializers

from shop.models import ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "is_primary", "order")

    def get_image(self, obj):
        if not obj.image:
            return None
        url = obj.image.url
        # S3/Cloudinary storages return an absolute URL — pass through.
        # Local FileSystemStorage returns a relative /media/... path; keep
        # it relative so the browser resolves it against the current
        # origin. Can't use request.build_absolute_uri here because Next.js
        # rewrites rewrite the Host header to the internal docker name
        # (backend:8000), which browsers can't resolve.
        return url
