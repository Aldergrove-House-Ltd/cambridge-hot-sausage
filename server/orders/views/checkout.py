import secrets

import stripe
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import PendingOrder
from shop.models import ProductVariant

stripe.api_key = settings.STRIPE_SECRET_KEY

# Generous cart cap purely as DoS protection. The cart payload now lives
# in the DB (PendingOrder.cart_snapshot), so we are no longer constrained
# by Stripe's 500-char metadata-value limit.
MAX_CART_ITEMS = 200
BUYER_COOKIE_NAME = "chs_buyer"
BUYER_COOKIE_MAX_AGE = 60 * 60 * 24  # 1 day


@method_decorator(csrf_exempt, name="dispatch")
class CreateCheckoutSessionView(APIView):
    # Public endpoint — disable DRF session auth so an admin cookie
    # in the same browser does not force CSRF on this anonymous flow.
    authentication_classes = []
    """
    POST /api/v1/orders/checkout

    1. Validate the cart against the DB.
    2. Snapshot it into a PendingOrder row (server-of-truth for the
       webhook — replaces the previous "pack into Stripe metadata" path
       which was vulnerable to SKU injection and capped at 500 chars).
    3. Create a Stripe Checkout session referencing the PendingOrder.
    4. Set a buyer_id cookie scoped to this checkout — the success page
       must echo it back when calling /api/v1/orders/session, preventing
       IDOR via Stripe session-ID leaks.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        cart_items = request.data.get("items", [])
        if not isinstance(cart_items, list) or not cart_items:
            return Response(
                {"error": "Cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(cart_items) > MAX_CART_ITEMS:
            return Response(
                {"error": f"Cart cannot have more than {MAX_CART_ITEMS} items."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            variant_ids = [int(item["variant_id"]) for item in cart_items]
        except (KeyError, TypeError, ValueError):
            return Response(
                {"error": "Each cart item must include a numeric variant_id."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        variants = ProductVariant.objects.filter(
            id__in=variant_ids,
            is_active=True,
            product__is_active=True,
        ).select_related("product")
        variant_map = {v.id: v for v in variants}

        line_items = []
        cart_snapshot = []

        for item in cart_items:
            variant = variant_map.get(int(item["variant_id"]))
            if not variant:
                return Response(
                    {"error": f"Variant {item['variant_id']} not found or inactive."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                quantity = int(item.get("quantity", 1))
            except (TypeError, ValueError):
                return Response(
                    {"error": "Quantity must be a positive integer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if quantity < 1:
                return Response(
                    {"error": "Quantity must be at least 1."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if variant.stock < quantity:
                return Response(
                    {"error": f"{variant.product.name} — {variant.name} is out of stock."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            line_items.append({
                "price_data": {
                    "currency": "gbp",
                    "unit_amount": int(variant.price * 100),
                    "product_data": {
                        "name": variant.product.name,
                        "description": variant.name,
                        "metadata": {"sku": variant.sku},
                    },
                },
                "quantity": quantity,
            })

            cart_snapshot.append({
                "variant_id": variant.id,
                "quantity": quantity,
                "sku": variant.sku,
                "product_name": variant.product.name,
                "variant_name": variant.name,
                "unit_price": str(variant.price),
            })

        buyer_id = secrets.token_urlsafe(32)
        pending = PendingOrder.objects.create(
            buyer_id=buyer_id,
            cart_snapshot=cart_snapshot,
            expires_at=PendingOrder.default_expires_at(),
        )

        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            phone_number_collection={"enabled": True},
            line_items=line_items,
            shipping_address_collection={
                "allowed_countries": [
                    "GB", "US", "FR", "DE", "ES", "IT", "NL", "BE",
                    "IE", "PT", "AT", "CH", "SE", "DK", "NO", "FI",
                    "PL", "CZ", "JP", "CN", "AU", "CA",
                ],
            },
            shipping_options=[
                {
                    "shipping_rate_data": {
                        "type": "fixed_amount",
                        "fixed_amount": {"amount": 350, "currency": "gbp"},
                        "display_name": "Royal Mail Standard",
                        "delivery_estimate": {
                            "minimum": {"unit": "business_day", "value": 3},
                            "maximum": {"unit": "business_day", "value": 5},
                        },
                    },
                },
                {
                    "shipping_rate_data": {
                        "type": "fixed_amount",
                        "fixed_amount": {"amount": 695, "currency": "gbp"},
                        "display_name": "Royal Mail Tracked 24",
                        "delivery_estimate": {
                            "minimum": {"unit": "business_day", "value": 1},
                            "maximum": {"unit": "business_day", "value": 2},
                        },
                    },
                },
            ],
            success_url=settings.FRONTEND_URL + "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=settings.FRONTEND_URL + "/cart",
            metadata={
                "type": "shop_order",
                "pending_id": str(pending.id),
                "buyer_id": buyer_id,
            },
        )

        response = Response({"url": session.url})
        response.set_cookie(
            BUYER_COOKIE_NAME,
            buyer_id,
            max_age=BUYER_COOKIE_MAX_AGE,
            httponly=True,
            samesite="Lax",
            secure=not settings.DEBUG,
            path="/",
        )
        return response
