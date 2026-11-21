"""
Seed the shop with realistic mock data for frontend development.

Usage:
    python manage.py seed_shop          # seed everything
    python manage.py seed_shop --flush  # wipe shop tables first, then seed
"""

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from shop.models import Category, Product, ProductImage, ProductVariant, Review


class Command(BaseCommand):
    help = "Seed the shop with mock categories, products, variants, images and reviews."

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete all existing shop data before seeding.",
        )

    def handle(self, *args, **options):
        if options["flush"]:
            self._flush()

        categories = self._seed_categories()
        products = self._seed_products(categories)
        self._seed_variants(products)
        self._seed_images(products)
        self._seed_reviews(products)

        self.stdout.write(self.style.SUCCESS("Shop seeded successfully."))

    # ── Flush ───────────────────────────────────────────────────

    def _flush(self):
        Review.objects.all().delete()
        ProductImage.objects.all().delete()
        ProductVariant.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        self.stdout.write(self.style.WARNING("Flushed all shop data."))

    # ── Categories ──────────────────────────────────────────────

    def _seed_categories(self):
        data = [
            {
                "name": "Hot Dogs",
                "description": "Our signature range of classic and gourmet hot dogs.",
                "children": [
                    {"name": "Classic", "description": "The originals — simple, honest, perfect."},
                    {"name": "Gourmet", "description": "Premium toppings and artisan buns."},
                    {"name": "Spicy", "description": "For those who like it hot."},
                ],
            },
            {
                "name": "Sides",
                "description": "Perfect companions for your hot dog.",
                "children": [
                    {"name": "Chips", "description": "Freshly cooked, properly seasoned."},
                    {"name": "Onion Rings", "description": "Beer-battered and golden."},
                ],
            },
            {
                "name": "Drinks",
                "description": "Cold drinks to wash it all down.",
                "children": [
                    {"name": "Soft Drinks", "description": "Fizzy favourites."},
                    {"name": "Hot Drinks", "description": "Tea, coffee, hot chocolate."},
                ],
            },
            {
                "name": "Merch",
                "description": "Take a piece of the barrow home with you.",
                "children": [],
            },
        ]

        cats = {}
        for i, cat_data in enumerate(data):
            parent = Category.objects.create(
                name=cat_data["name"],
                slug=slugify(cat_data["name"]),
                description=cat_data["description"],
                order=i,
            )
            cats[cat_data["name"]] = parent

            for j, child_data in enumerate(cat_data.get("children", [])):
                child = Category.objects.create(
                    name=child_data["name"],
                    slug=slugify(f"{cat_data['name']}-{child_data['name']}"),
                    description=child_data["description"],
                    parent=parent,
                    order=j,
                )
                cats[child_data["name"]] = child

        self.stdout.write(f"  Created {len(cats)} categories.")
        return cats

    # ── Products ────────────────────────────────────────────────

    def _seed_products(self, cats):
        data = [
            {
                "name": "The Original Cambridge",
                "description": "The one that started it all. Our signature pork sausage in a freshly baked bun with caramelised onions and your choice of sauce. Forty years of perfection.",
                "categories": ["Hot Dogs", "Classic"],
                "is_featured": True,
            },
            {
                "name": "The Fitzroy",
                "description": "A premium gourmet dog with truffle mayo, crispy shallots and aged cheddar on a brioche bun. Named after the street where it all began.",
                "categories": ["Hot Dogs", "Gourmet"],
                "is_featured": True,
            },
            {
                "name": "The Chilli Devil",
                "description": "Our spicy Cambridge sausage loaded with jalapeños, sriracha mayo, and pickled red onions. Not for the faint-hearted.",
                "categories": ["Hot Dogs", "Spicy"],
                "is_featured": True,
            },
            {
                "name": "The Double Stack",
                "description": "Two sausages, one bun, maximum satisfaction. Comes with American mustard, ketchup and crispy onions.",
                "categories": ["Hot Dogs", "Classic"],
                "is_featured": False,
            },
            {
                "name": "The Smoky BBQ",
                "description": "Smoked pork sausage with house-made BBQ sauce, coleslaw and crispy bacon bits on a toasted sesame bun.",
                "categories": ["Hot Dogs", "Gourmet"],
                "is_featured": False,
            },
            {
                "name": "The Ring of Fire",
                "description": "Carolina reaper-infused sausage with ghost pepper sauce and habanero relish. Our hottest creation — sign the waiver first.",
                "categories": ["Hot Dogs", "Spicy"],
                "is_featured": False,
            },
            {
                "name": "Chips",
                "description": "Hand-cut, twice-fried chips with sea salt. Properly crispy, properly good.",
                "categories": ["Sides", "Chips"],
                "is_featured": False,
            },
            {
                "name": "Loaded Chips",
                "description": "Our hand-cut chips loaded with melted cheese, bacon bits and spring onions. A meal on its own.",
                "categories": ["Sides", "Chips"],
                "is_featured": False,
            },
            {
                "name": "Onion Rings",
                "description": "Beer-battered onion rings, golden and crispy. Perfect for sharing (but you won't want to).",
                "categories": ["Sides", "Onion Rings"],
                "is_featured": False,
            },
            {
                "name": "Coca-Cola",
                "description": "Ice-cold Coca-Cola. The classic.",
                "categories": ["Drinks", "Soft Drinks"],
                "is_featured": False,
            },
            {
                "name": "Barrow Blend Coffee",
                "description": "Our house-roasted blend, brewed fresh every hour. Strong, smooth and properly Cambridge.",
                "categories": ["Drinks", "Hot Drinks"],
                "is_featured": False,
            },
            {
                "name": "The Hot Sausage Company T-Shirt",
                "description": "100% organic cotton, screen-printed in Cambridge. Features our iconic barrow illustration on the front.",
                "categories": ["Merch"],
                "is_featured": True,
            },
        ]

        products = {}
        for prod_data in data:
            product = Product.objects.create(
                name=prod_data["name"],
                slug=slugify(prod_data["name"]),
                description=prod_data["description"],
                is_featured=prod_data.get("is_featured", False),
            )
            for cat_name in prod_data["categories"]:
                if cat_name in cats:
                    product.categories.add(cats[cat_name])
            products[prod_data["name"]] = product

        self.stdout.write(f"  Created {len(products)} products.")
        return products

    # ── Variants ────────────────────────────────────────────────

    def _seed_variants(self, products):
        variant_map = {
            "The Original Cambridge": [
                {"name": "Regular", "price": "5.50", "stock": 999},
                {"name": "Large", "price": "7.50", "stock": 999},
                {"name": "Kids", "price": "3.50", "stock": 999},
            ],
            "The Fitzroy": [
                {"name": "Regular", "price": "8.00", "stock": 999},
                {"name": "Large", "price": "10.50", "stock": 999},
            ],
            "The Chilli Devil": [
                {"name": "Regular", "price": "6.50", "stock": 999},
                {"name": "Large", "price": "8.50", "stock": 999},
                {"name": "Extra Hot", "price": "7.00", "stock": 999},
            ],
            "The Double Stack": [
                {"name": "Standard", "price": "9.00", "stock": 999},
                {"name": "With Cheese", "price": "10.00", "stock": 999},
            ],
            "The Smoky BBQ": [
                {"name": "Regular", "price": "7.50", "stock": 999},
                {"name": "Large", "price": "9.50", "stock": 999},
            ],
            "The Ring of Fire": [
                {"name": "Regular (if you dare)", "price": "7.00", "stock": 999},
                {"name": "Large (legend)", "price": "9.00", "stock": 999},
            ],
            "Chips": [
                {"name": "Regular", "price": "3.00", "stock": 999},
                {"name": "Large", "price": "4.50", "stock": 999},
            ],
            "Loaded Chips": [
                {"name": "Regular", "price": "5.00", "stock": 999},
                {"name": "Large", "price": "7.00", "stock": 999},
            ],
            "Onion Rings": [
                {"name": "6 Rings", "price": "3.50", "stock": 999},
                {"name": "12 Rings", "price": "6.00", "stock": 999},
            ],
            "Coca-Cola": [
                {"name": "330ml Can", "price": "1.50", "stock": 999},
                {"name": "500ml Bottle", "price": "2.50", "stock": 999},
            ],
            "Barrow Blend Coffee": [
                {"name": "Small", "price": "2.50", "stock": 999},
                {"name": "Regular", "price": "3.00", "stock": 999},
                {"name": "Large", "price": "3.50", "stock": 999},
            ],
            "The Hot Sausage Company T-Shirt": [
                {"name": "S", "price": "22.00", "stock": 50},
                {"name": "M", "price": "22.00", "stock": 80},
                {"name": "L", "price": "22.00", "stock": 60},
                {"name": "XL", "price": "22.00", "stock": 40},
                {"name": "XXL", "price": "24.00", "stock": 20},
            ],
        }

        count = 0
        for product_name, variants in variant_map.items():
            product = products.get(product_name)
            if not product:
                continue
            for i, v in enumerate(variants):
                ProductVariant.objects.create(
                    product=product,
                    name=v["name"],
                    price=v["price"],
                    compare_at_price=v.get("compare_at_price"),
                    stock=v["stock"],
                    order=i,
                )
                count += 1

        self.stdout.write(f"  Created {count} variants.")

    # ── Images (placeholder URLs — no real files needed) ────────

    def _seed_images(self, products):
        """
        We don't ship real image files in the seed. Instead we create
        ProductImage rows with empty image fields. The frontend should
        handle missing images gracefully with a fallback placeholder.
        In production, admins upload real images via the admin panel.
        """
        count = 0
        for product in products.values():
            ProductImage.objects.create(
                product=product,
                alt_text=product.name,
                is_primary=True,
                order=0,
            )
            count += 1

        self.stdout.write(f"  Created {count} placeholder images.")

    # ── Reviews ─────────────────────────────────────────────────

    def _seed_reviews(self, products):
        review_data = [
            {
                "product": "The Original Cambridge",
                "reviews": [
                    {"author_name": "Eleanor W.", "author_email": "e@test.com", "rating": 5, "title": "Perfection", "text": "Been coming here since 1992. The sausage hasn't changed and that's exactly why I keep coming back. Proper Cambridge institution."},
                    {"author_name": "James H.", "author_email": "j@test.com", "rating": 5, "title": "The best hot dog in England", "text": "I've tried hot dogs all over the country and nothing compares. The bun-to-sausage ratio is spot on, the onions are perfectly caramelised."},
                    {"author_name": "Sophie C.", "author_email": "s@test.com", "rating": 4, "title": "Great as always", "text": "Solid every single time. Only four stars because the queue was 15 minutes on Saturday, but honestly that speaks for itself."},
                ],
            },
            {
                "product": "The Fitzroy",
                "reviews": [
                    {"author_name": "Oliver P.", "author_email": "o@test.com", "rating": 5, "title": "Worth every penny", "text": "The truffle mayo is incredible. You wouldn't expect this level of quality from a street barrow. Blown away."},
                    {"author_name": "Priya K.", "author_email": "p@test.com", "rating": 5, "title": "My new favourite", "text": "Tried it on a colleague's recommendation and now I'm hooked. The brioche bun makes all the difference."},
                ],
            },
            {
                "product": "The Chilli Devil",
                "reviews": [
                    {"author_name": "Daniel O.", "author_email": "d@test.com", "rating": 5, "title": "Proper hot!", "text": "Finally a place that takes spice seriously. The jalapeños and sriracha combo is bang on. Will be back for more punishment."},
                    {"author_name": "Kenji T.", "author_email": "k@test.com", "rating": 4, "title": "Nicely spiced", "text": "Good level of heat without being silly about it. The pickled onions add a lovely tang to cut through the chilli."},
                ],
            },
            {
                "product": "Chips",
                "reviews": [
                    {"author_name": "Grace A.", "author_email": "g@test.com", "rating": 5, "title": "Best chips in Cambridge", "text": "Hand-cut and properly crispy. None of that soggy nonsense. These are chips done right."},
                ],
            },
            {
                "product": "The Hot Sausage Company T-Shirt",
                "reviews": [
                    {"author_name": "Liam G.", "author_email": "l@test.com", "rating": 5, "title": "Quality merch", "text": "Soft cotton, great print quality. Gets comments every time I wear it. A proper conversation starter."},
                    {"author_name": "Charlotte B.", "author_email": "c@test.com", "rating": 4, "title": "Love the design", "text": "The barrow illustration is beautiful. Runs slightly large so maybe size down if you're between sizes."},
                ],
            },
        ]

        count = 0
        for entry in review_data:
            product = products.get(entry["product"])
            if not product:
                continue
            for r in entry["reviews"]:
                Review.objects.create(
                    product=product,
                    author_name=r["author_name"],
                    author_email=r["author_email"],
                    rating=r["rating"],
                    title=r.get("title", ""),
                    text=r["text"],
                    is_approved=True,
                )
                count += 1

        self.stdout.write(f"  Created {count} reviews (all pre-approved).")
