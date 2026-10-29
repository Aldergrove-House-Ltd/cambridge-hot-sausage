from django.db.models import Exists, OuterRef
from django_filters import rest_framework as filters

from shop.models import Category, Product


class ProductFilter(filters.FilterSet):
    category = filters.CharFilter(
        method="filter_category",
        help_text=(
            "Filter by category slug. Includes products in all descendant "
            "categories (e.g. category=drinks returns everything under "
            "Hot Drinks and Soft Drinks too)."
        ),
    )
    min_price = filters.NumberFilter(
        field_name="variants__price",
        lookup_expr="gte",
        label="Minimum price",
    )
    max_price = filters.NumberFilter(
        field_name="variants__price",
        lookup_expr="lte",
        label="Maximum price",
    )
    featured = filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = Product
        fields = ["category", "min_price", "max_price", "featured"]

    def filter_category(self, queryset, name, value):
        try:
            root = Category.objects.get(slug=value, is_active=True)
        except Category.DoesNotExist:
            return queryset.none()
        # MPTT descendants = single lft/rght range scan (indexed).
        descendant_ids = root.get_descendants(include_self=True).values("id")
        # Exists() on the M2M through-table instead of .filter(cats__in=...)
        # — avoids the M2M join that would duplicate rows and force a
        # .distinct() on potentially millions of products.
        product_cat_through = Product.categories.through
        return queryset.filter(
            Exists(
                product_cat_through.objects.filter(
                    product_id=OuterRef("pk"),
                    category_id__in=descendant_ids,
                )
            )
        )
