"""One-shot: seed ~50 demo products with varied markdown descriptions.

Run via (from inside the backend container):
    python _seed_products.py

Idempotent: deletes products with these slugs before recreating.
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

import random
from decimal import Decimal
from shop.models import Product, Category, ProductVariant, Review

random.seed(42)  # Deterministic — same reviews on each run


# ─── Description templates ────────────────────────────────────────
# Rotated across products so the shop showcases every markdown feature
# the frontend renders: headings, lists, tables, blockquotes, code,
# task lists, strikethrough, inline code, links, horizontal rules.

TPL_FULL = """# {name}

The *original* **Fitzroy Street** favourite — hot, juicy, and ~~boring never~~ always proper.

## Why you'll love it

- Pork from local farms
- Hand-rolled every morning
- Served in a soft brioche bun
  - With mustard
  - With ketchup
  - Or both — we don't judge

## Toppings (pick your fighters)

1. Classic yellow mustard
2. Sweet caramelised onions
3. Smoky BBQ
   1. House rub
   2. Charred jalapeños

### Spice level

| Level | Heat         | Notes                   |
|-------|--------------|-------------------------|
| 1     | Mild         | Grandma-approved        |
| 2     | Medium       | A gentle warm-up        |
| 3     | Hot          | For the brave           |
| 4     | Chilly 🌶    | Enter the challenge     |

### Tasks for the kitchen

- [x] Grill the sausage
- [x] Toast the bun
- [ ] Call Dave about the onions

> "Officially voted the best hot dogs around by our most important critic — my very own grandmother."
> — *The founder, probably*

### Quick recipe

```bash
grill sausage --heat high --minutes 8
toast bun --butter yes
assemble --mustard --onions
```

Inline code: use `--extra-cheese` if you're feeling fancy.

Learn more at [hotsausagecompany.com](https://www.hotsausagecompany.com/).

---

Allergen notice: contains **gluten, mustard**. Vegan option available."""


TPL_BULLETS = """## {name}

- Slow-cooked **{hours} hours**
- Topped with {topping}
- Served with our house `{sauce}`

> {quote}

1. Order
2. Devour
3. Repeat
"""


TPL_TABLE = """### {name}

{tagline}

| Feature       | Details                 |
|---------------|-------------------------|
| Origin        | {origin}                |
| Spice level   | {spice}/5               |
| Pairs with    | {pairs}                 |
| Ready in      | {ready} minutes         |

**Ingredients:** {ingredients}
"""


TPL_RECIPE = """# {name}

A **{adj}** take on a Fitzroy classic.

### How we make it

```
sear   — {t1}s each side
rest   — {t2}s
dress  — {dress}
serve  — hot, now, don't wait
```

### Nutrition snapshot

- Protein: **{protein}g**
- Fat: {fat}g
- Carbs: {carbs}g

Allergens: {allergens}
"""


TPL_QUOTE = """## {name}

*{tagline}*

> {quote}
>
> — {attribution}

**What's in it:**

- {i1}
- {i2}
- {i3}

[See the full menu →](/en/shop)
"""


TPL_WARNING = """# {name}  🔥🔥🔥

> ⚠️  **Warning:** Not for the faint of heart.

This one hits different. If you can finish it in under {minutes} minutes without water, your name goes on **The Wall**.

- Scoville rating: ~**{sc}**
- Ingredients: {ingredients}
- House rule: no refunds for tears

~~Suitable for all ages~~ Minimum age 16. Signed waiver at the counter.

### Rules of the Challenge

1. One drink only — milk or water
2. No breaks longer than 30 seconds
3. Must be eaten in one sitting
4. All sauce counts
"""


TPL_PLAIN = """{tagline}

{paragraph}

**Available in:** {sizes}

---

Vegan: {vegan}. Gluten-free bun on request.
"""


TPL_COMBO = """## {name}

Everything you need in one go. Save ~**£{save}** vs. ordering separately.

### Includes

- [x] {item1}
- [x] {item2}
- [x] {item3}

### Perfect for

| Occasion       | Why                        |
|----------------|----------------------------|
| {occ1}         | {reason1}                  |
| {occ2}         | {reason2}                  |

> *"{quote}"* — {attrib}
"""


# ─── Category tree ───────────────────────────────────────────────

CATEGORIES = [
    ("Hot Dogs", "hot-dogs", None),
    ("Classic Dogs", "classic-dogs", "hot-dogs"),
    ("Specialty Dogs", "specialty-dogs", "hot-dogs"),
    ("Veggie & Vegan", "veggie-vegan", "hot-dogs"),
    ("Chilly Challenge", "chilly-challenge", "hot-dogs"),
    ("Sides", "sides", None),
    ("Combos", "combos", None),
    ("Drinks", "drinks", None),
    ("Soft Drinks", "soft-drinks", "drinks"),
    ("Hot Drinks", "hot-drinks", "drinks"),
    ("Specials", "specials", None),
]


# ─── Products ────────────────────────────────────────────────────
# Each tuple: (name, slug, category_slug, template_key, template_vars,
#              variants, is_featured)
# variants: list of (name, sku_tail, price, stock)

P = [
    # ── Classic Dogs ──
    ("Cambridge Classic", "cambridge-classic", "classic-dogs",
     "full", {},
     [("Regular", "CC-R", Decimal("5.50"), 50), ("Large", "CC-L", Decimal("7.00"), 30)], True),

    ("Smoky BBQ Sausage", "smoky-bbq", "classic-dogs",
     "bullets", {"hours": 8, "topping": "crispy onions", "sauce": "bbq-sauce-v2",
                 "quote": "A fan-favourite since **1999**."},
     [("Standard", "BBQ-STD", Decimal("6.00"), 40), ("Jumbo", "BBQ-JMB", Decimal("7.50"), 20)], False),

    ("New York Street Dog", "ny-street", "classic-dogs",
     "table", {"tagline": "Steamed just like the sidewalk cart in Midtown.",
               "origin": "Brooklyn-style recipe", "spice": 2, "pairs": "yellow mustard + sauerkraut",
               "ready": 4, "ingredients": "pork, beef, brined sauerkraut, soft bun"},
     [("Single", "NY-1", Decimal("5.75"), 45)], False),

    ("Chicago Style Dog", "chicago-style", "classic-dogs",
     "recipe", {"adj": "no-ketchup", "t1": 90, "t2": 30,
                "dress": "mustard, relish, onion, tomato, pickle, celery salt",
                "protein": 18, "fat": 22, "carbs": 32, "allergens": "gluten, mustard, celery"},
     [("Single", "CHI-1", Decimal("6.25"), 35)], True),

    ("Vienna Beef Dog", "vienna-beef", "classic-dogs",
     "quote", {"tagline": "100% all-beef, snap in every bite.",
               "quote": "The snap when it bites back is the whole point.",
               "attribution": "A regular, politely",
               "i1": "All-beef sausage", "i2": "Poppy seed bun", "i3": "Classic mustard"},
     [("Standard", "VIE-STD", Decimal("6.00"), 30)], False),

    ("German Bratwurst", "german-brat", "classic-dogs",
     "plain", {"tagline": "Grilled slow, served proud.",
               "paragraph": "Our *bratwurst* is pork-and-veal, lightly seasoned so the meat does the talking. Comes with pretzel bun or classic.",
               "sizes": "Regular (160g), Large (220g)",
               "vegan": "No"},
     [("Regular", "BRAT-R", Decimal("6.75"), 25), ("Large", "BRAT-L", Decimal("8.25"), 15)], False),

    ("Polish Kielbasa Dog", "polish-kielbasa", "classic-dogs",
     "bullets", {"hours": 4, "topping": "sautéed cabbage",
                 "sauce": "polish-mustard-sauce",
                 "quote": "Dziadek would be proud."},
     [("Standard", "POL-STD", Decimal("6.50"), 20)], False),

    ("The Fitzroy Reuben", "fitzroy-reuben", "classic-dogs",
     "quote", {"tagline": "Sausage meets deli classic.",
               "quote": "Why choose between a dog and a Reuben? We asked ourselves the same thing.",
               "attribution": "The kitchen team, defending the dish",
               "i1": "Beef sausage", "i2": "Sauerkraut + Thousand Island", "i3": "Swiss cheese, grilled bun"},
     [("Standard", "REU-STD", Decimal("7.00"), 25)], True),

    # ── Specialty Dogs ──
    ("Jalapeño Firecracker", "jalapeno-firecracker", "specialty-dogs",
     "warning", {"minutes": 5, "sc": "25,000",
                 "ingredients": "pork sausage, pickled jalapeños, chilli oil, pepper-jack"},
     [("Single", "JAL-1", Decimal("6.75"), 30)], False),

    ("Chilli Cheese Dog", "chilli-cheese", "specialty-dogs",
     "bullets", {"hours": 3, "topping": "house chilli con carne",
                 "sauce": "cheese-sauce-sharp",
                 "quote": "Essentially a bowl of chilli with a dog hidden inside."},
     [("Standard", "CHIL-STD", Decimal("7.25"), 35)], True),

    ("The Dirty Deacon", "dirty-deacon", "specialty-dogs",
     "recipe", {"adj": "fully-loaded",
                "t1": 100, "t2": 45,
                "dress": "chilli, cheese, bacon, onions, mustard, mayo, pickles",
                "protein": 32, "fat": 48, "carbs": 55,
                "allergens": "gluten, dairy, mustard, egg"},
     [("Standard", "DD-STD", Decimal("8.50"), 25)], True),

    ("Breakfast Sausage Dog", "breakfast-dog", "specialty-dogs",
     "plain", {"tagline": "Morning in a bun.",
               "paragraph": "Pork breakfast sausage, fried egg, crispy hashbrown, HP sauce. Served **until 11am**.",
               "sizes": "Regular only",
               "vegan": "Vegan version available"},
     [("Standard", "BRK-STD", Decimal("7.00"), 20)], False),

    ("Honey Mustard Hog", "honey-mustard-hog", "specialty-dogs",
     "table", {"tagline": "Sticky, sweet, a little bit cheeky.",
               "origin": "In-house glaze", "spice": 1,
               "pairs": "crispy fried shallots", "ready": 5,
               "ingredients": "pork sausage, local honey, English mustard, brioche"},
     [("Regular", "HM-R", Decimal("6.25"), 30)], False),

    ("Truffle Luxury Dog", "truffle-luxury", "specialty-dogs",
     "quote", {"tagline": "Our Sunday-best dog.",
               "quote": "If a hot dog could wear a dinner jacket, this would be it.",
               "attribution": "Local food blogger",
               "i1": "Dry-aged beef sausage", "i2": "Truffle aioli",
               "i3": "Shaved parmesan, caramelised onion"},
     [("Standard", "TRF-STD", Decimal("12.00"), 15)], True),

    ("Spicy Chorizo Dog", "spicy-chorizo", "specialty-dogs",
     "bullets", {"hours": 2, "topping": "smoked paprika aioli",
                 "sauce": "chorizo-oil",
                 "quote": "Spanish holiday on a bun."},
     [("Standard", "CHZ-STD", Decimal("6.75"), 30)], False),

    # ── Veggie & Vegan ──
    ("Classic Veggie Sausage", "veggie-sausage", "veggie-vegan",
     "table", {"tagline": "Our *plant-based* classic — all the flavour, none of the meat.",
               "origin": "Pea protein base", "spice": 1,
               "pairs": "caramelised onion + vegan mayo", "ready": 4,
               "ingredients": "pea protein, smoked paprika, a dash of magic"},
     [("Standard", "VEG-STD", Decimal("5.00"), 25)], True),

    ("Vegan Chilli Dog", "vegan-chilli", "veggie-vegan",
     "bullets", {"hours": 3, "topping": "bean & lentil chilli",
                 "sauce": "cashew-cheese",
                 "quote": "You won't miss the meat. Promise."},
     [("Standard", "VCH-STD", Decimal("6.50"), 20)], False),

    ("Beyond Meat Dog", "beyond-meat", "veggie-vegan",
     "plain", {"tagline": "100% plant-based, 100% proper dog energy.",
               "paragraph": "Grilled Beyond sausage, dressed exactly like our Cambridge Classic. Vegan brioche, vegan everything.",
               "sizes": "Regular, Large",
               "vegan": "Yes"},
     [("Regular", "BM-R", Decimal("6.50"), 20), ("Large", "BM-L", Decimal("8.00"), 10)], False),

    ("Halloumi Melt Dog", "halloumi-melt", "veggie-vegan",
     "quote", {"tagline": "Veggie, but make it indulgent.",
               "quote": "Halloumi in a hot dog shouldn't work. It does.",
               "attribution": "Everyone who tries it",
               "i1": "Veggie sausage", "i2": "Grilled halloumi slab",
               "i3": "Chilli jam, rocket"},
     [("Standard", "HAL-STD", Decimal("6.75"), 25)], True),

    ("Spicy Bean Dog", "spicy-bean", "veggie-vegan",
     "warning", {"minutes": 8, "sc": "15,000",
                 "ingredients": "black bean sausage, chipotle, pickled onions, jalapeño slaw"},
     [("Standard", "SB-STD", Decimal("5.75"), 20)], False),

    # ── Chilly Challenge ──
    ("Challenge Dog Lv 1 — Mild", "challenge-1", "chilly-challenge",
     "plain", {"tagline": "Dip your toe in. Grandma approved.",
               "paragraph": "Our starter challenge dog. Mild heat, big flavour. **Finish it in 10 minutes** to get your name on the Lv 1 board.",
               "sizes": "Single serve",
               "vegan": "On request"},
     [("Single", "CH1-1", Decimal("6.00"), 20)], False),

    ("Challenge Dog Lv 2 — Medium", "challenge-2", "chilly-challenge",
     "warning", {"minutes": 8, "sc": "10,000",
                 "ingredients": "pork, serrano, chipotle mayo, pickled jalapeños"},
     [("Single", "CH2-1", Decimal("6.75"), 20)], False),

    ("Challenge Dog Lv 3 — Hot", "challenge-3", "chilly-challenge",
     "warning", {"minutes": 6, "sc": "50,000",
                 "ingredients": "pork, habanero, ghost pepper mash, scorpion mayo"},
     [("Single", "CH3-1", Decimal("7.50"), 20)], True),

    ("Challenge Dog Lv 4 — Chilly 🌶", "challenge-4", "chilly-challenge",
     "warning", {"minutes": 5, "sc": "500,000+",
                 "ingredients": "pork, Carolina Reaper purée, ghost extract (handle with gloves)"},
     [("Single", "CH4-1", Decimal("9.00"), 15)], True),

    ("Ghost Pepper Grinder", "ghost-grinder", "chilly-challenge",
     "warning", {"minutes": 4, "sc": "1,000,000+",
                 "ingredients": "beef, ghost pepper, chilli extract, no mercy"},
     [("Single", "GPG-1", Decimal("11.00"), 10)], False),

    # ── Sides ──
    ("Hand-Cut Chips", "chips", "sides",
     "plain", {"tagline": "Twice-fried. Always crispy.",
               "paragraph": "Maris Piper potatoes, cut by hand, cooked twice in beef dripping. Rock salt, done.",
               "sizes": "Small, Regular, Large",
               "vegan": "Vegan option fried in sunflower oil"},
     [("Small", "CHP-S", Decimal("3.00"), 60), ("Regular", "CHP-R", Decimal("4.00"), 60), ("Large", "CHP-L", Decimal("5.00"), 40)], True),

    ("Loaded Cheesy Fries", "loaded-fries", "sides",
     "bullets", {"hours": 1, "topping": "melted cheddar + crispy bacon",
                 "sauce": "spring-onion-ranch",
                 "quote": "Dangerous on a hangover."},
     [("Regular", "LF-R", Decimal("6.50"), 30), ("Sharing", "LF-SH", Decimal("9.00"), 20)], False),

    ("Onion Rings", "onion-rings", "sides",
     "plain", {"tagline": "Beer-battered, golden, loud crunch.",
               "paragraph": "Six big rings. Crispy coat, sweet onion. Served with a side of our smoky mayo.",
               "sizes": "6-pack",
               "vegan": "Yes"},
     [("6-pack", "OR-6", Decimal("4.50"), 40)], False),

    ("Cole Slaw", "cole-slaw", "sides",
     "plain", {"tagline": "Not that mayo-soup kind. The crunchy kind.",
               "paragraph": "Red + white cabbage, carrot, apple, cider vinegar, light mayo. Fresh every morning.",
               "sizes": "Small pot",
               "vegan": "Vegan version available"},
     [("Pot", "CS-P", Decimal("2.75"), 50)], False),

    ("Jalapeño Poppers", "jalapeno-poppers", "sides",
     "warning", {"minutes": 10, "sc": "5,000",
                 "ingredients": "jalapeños, cream cheese, crispy panko"},
     [("6-pack", "JP-6", Decimal("5.50"), 30)], False),

    ("Mozzarella Sticks", "mozz-sticks", "sides",
     "plain", {"tagline": "Pull-apart, cheesy, zero regrets.",
               "paragraph": "Six golden sticks of panko-crusted mozzarella. Served with marinara.",
               "sizes": "6-pack",
               "vegan": "No"},
     [("6-pack", "MOZ-6", Decimal("5.00"), 30)], False),

    ("Crispy Pickles", "crispy-pickles", "sides",
     "bullets", {"hours": 0, "topping": "dill ranch dip",
                 "sauce": "southern-dill-ranch",
                 "quote": "You've never had a pickle like this. Trust us."},
     [("Portion", "PCK-P", Decimal("4.00"), 25)], False),

    ("Mini Corn Dogs", "mini-corn-dogs", "sides",
     "plain", {"tagline": "Six bite-sized corn dogs. Pure state-fair joy.",
               "paragraph": "Pork sausage in sweet cornmeal batter, deep-fried. Served with yellow mustard and ketchup.",
               "sizes": "6-pack",
               "vegan": "No"},
     [("6-pack", "MCD-6", Decimal("5.50"), 30)], False),

    # ── Combos ──
    ("Classic Combo", "classic-combo", "combos",
     "combo", {"save": "2.50",
               "item1": "Any classic dog",
               "item2": "Regular chips",
               "item3": "Any soft drink",
               "occ1": "Quick lunch", "reason1": "Fast, filling, familiar",
               "occ2": "Post-pub snack", "reason2": "Soaks up anything",
               "quote": "The one I order every single time.", "attrib": "Weekly regular"},
     [("Standard", "CC-COMBO", Decimal("11.00"), 50)], True),

    ("Family Pack", "family-pack", "combos",
     "combo", {"save": "6.00",
               "item1": "4× Cambridge Classic dogs",
               "item2": "Large chips (sharing)",
               "item3": "4× soft drinks",
               "occ1": "Family teatime", "reason1": "Nobody fights over food",
               "occ2": "Big group", "reason2": "Scales to any gathering",
               "quote": "Easier than cooking. Also tastier.", "attrib": "Honest parent"},
     [("4-person", "FP-4", Decimal("28.00"), 20)], False),

    ("Student Special", "student-special", "combos",
     "plain", {"tagline": "Any dog + chips + drink. **Thursdays only**.",
               "paragraph": "Student ID required. Not valid with other offers. One per customer.",
               "sizes": "Thursday 12–8pm",
               "vegan": "Vegan options included"},
     [("Standard", "STU-STD", Decimal("8.50"), 100)], True),

    ("Date Night Duo", "date-night", "combos",
     "quote", {"tagline": "Two dogs, two drinks, shared chips. Low effort, high win.",
               "quote": "He proposed over chilli cheese dogs. Now that's a Cambridge story.",
               "attribution": "Married customer, last winter",
               "i1": "2× specialty dogs", "i2": "Loaded cheesy fries",
               "i3": "2× craft lemonades"},
     [("For two", "DN-2", Decimal("18.00"), 30)], False),

    # ── Soft Drinks ──
    ("Craft Lemonade", "craft-lemonade", "soft-drinks",
     "plain", {"tagline": "Pressed, not powdered.",
               "paragraph": "Sicilian lemons, cane sugar, a hint of mint. Made fresh every morning in the barrow.",
               "sizes": "330ml bottle",
               "vegan": "Yes"},
     [("330ml", "LMN-330", Decimal("3.50"), 60)], False),

    ("Cold Brew", "cold-brew", "soft-drinks",
     "plain", {"tagline": "Slow-steeped. Smooth. No bitter edge.",
               "paragraph": "Hasbean beans, 18-hour cold brew. Serve black or with oat milk.",
               "sizes": "250ml cup",
               "vegan": "Yes"},
     [("250ml", "CB-250", Decimal("3.00"), 40)], False),

    ("Sparkling Water", "sparkling-water", "soft-drinks",
     "plain", {"tagline": "Fizzy. Hydrating. Does the job.",
               "paragraph": "Still or sparkling. Glass bottle. No fuss.",
               "sizes": "330ml",
               "vegan": "Yes"},
     [("Still", "SW-STL", Decimal("2.00"), 100), ("Sparkling", "SW-SPK", Decimal("2.00"), 100)], False),

    ("Local Craft Beer", "local-craft-beer", "soft-drinks",
     "bullets", {"hours": 72, "topping": "a pub-style pour",
                 "sauce": "from-the-tap",
                 "quote": "Brewed 15 minutes down the road."},
     [("Pale Ale", "LCB-PA", Decimal("4.50"), 40), ("IPA", "LCB-IPA", Decimal("4.75"), 30), ("Stout", "LCB-ST", Decimal("4.75"), 20)], False),

    ("House Soda Float", "soda-float", "soft-drinks",
     "plain", {"tagline": "Cream soda + a scoop of vanilla.",
               "paragraph": "Served in a tall glass with a long spoon. Childhood, basically.",
               "sizes": "One size, generous",
               "vegan": "Vegan ice cream option"},
     [("Standard", "SF-STD", Decimal("4.00"), 30)], False),

    ("Ginger Beer", "ginger-beer", "soft-drinks",
     "plain", {"tagline": "Proper ginger kick. No sugar overload.",
               "paragraph": "Fiery, non-alcoholic, in a long glass with ice and a lime wedge.",
               "sizes": "330ml",
               "vegan": "Yes"},
     [("330ml", "GB-330", Decimal("3.25"), 50)], False),

    # ── Hot Drinks ──
    ("Cambridge Cup Tea", "cambridge-tea", "hot-drinks",
     "plain", {"tagline": "The one your nan would approve of.",
               "paragraph": "English breakfast blend, strong, in a proper mug. Milk and sugar at the counter.",
               "sizes": "Mug",
               "vegan": "Oat milk available"},
     [("Mug", "TEA-M", Decimal("2.50"), 100)], False),

    ("Hot Chocolate", "hot-chocolate", "hot-drinks",
     "quote", {"tagline": "Real cocoa, real milk, real marshmallows.",
               "quote": "Hot chocolate at a sausage cart. Why not? It's cold outside.",
               "attribution": "Us, defending the menu",
               "i1": "Belgian cocoa", "i2": "Steamed whole milk",
               "i3": "Marshmallows + cocoa dust"},
     [("Standard", "HC-STD", Decimal("3.50"), 50), ("Deluxe + cream", "HC-DLX", Decimal("4.50"), 30)], False),

    # ── Specials ──
    ("Monthly Mystery Sausage", "monthly-mystery", "specials",
     "quote", {"tagline": "A new recipe every month. We don't tell you what's in it until you've eaten it.",
               "quote": "It's always a game. Sometimes you win big.",
               "attribution": "A loyal regular",
               "i1": "Changes monthly", "i2": "Always locally sourced", "i3": "Always a surprise"},
     [("This month", "MM-TM", Decimal("7.50"), 40)], True),

    ("Festival Loaded Dog", "festival-loaded", "specials",
     "combo", {"save": "3.00",
               "item1": "Specialty dog of your choice",
               "item2": "Loaded cheesy fries",
               "item3": "Craft lemonade",
               "occ1": "Summer festivals", "reason1": "One hand holds the dog, one hand holds the drink",
               "occ2": "Cambridge Folk Fest", "reason2": "We'll be at a stall near the main stage",
               "quote": "This got me through Latitude. Twice.", "attrib": "Returning festival customer"},
     [("Standard", "FEST-STD", Decimal("13.50"), 25)], False),

    ("Christmas Special — Turkey & Cranberry", "christmas-special", "specials",
     "table", {"tagline": "Available **December only**.",
               "origin": "In-house festive recipe", "spice": 1,
               "pairs": "mulled wine (not sold here, we're a sausage cart)", "ready": 6,
               "ingredients": "turkey & pork sausage, cranberry sauce, stuffing crumb, crispy sage"},
     [("Standard", "XMAS-STD", Decimal("7.50"), 30)], False),

    ("Summer BBQ Pulled Pork", "summer-pulled-pork", "specials",
     "recipe", {"adj": "slow-smoked", "t1": 180, "t2": 60,
                "dress": "hickory BBQ, apple slaw, crispy shallots",
                "protein": 28, "fat": 24, "carbs": 44, "allergens": "gluten"},
     [("Standard", "SPP-STD", Decimal("8.00"), 25)], False),

    ("Student Union Freshers Dog", "freshers-dog", "specials",
     "plain", {"tagline": "Welcome to Cambridge. First dog's at a special price.",
               "paragraph": "**Freshers Week only.** Student ID required. One per student. Choose any Classic Dog.",
               "sizes": "Freshers Week",
               "vegan": "Vegan options qualify"},
     [("Standard", "FR-STD", Decimal("4.00"), 200)], True),
]


# ─── Build ────────────────────────────────────────────────────────

TEMPLATES = {
    "full": TPL_FULL,
    "bullets": TPL_BULLETS,
    "table": TPL_TABLE,
    "recipe": TPL_RECIPE,
    "quote": TPL_QUOTE,
    "warning": TPL_WARNING,
    "plain": TPL_PLAIN,
    "combo": TPL_COMBO,
}


# Idempotent: wipe existing demo products first
slugs = [p[1] for p in P]
deleted, _ = Product.objects.filter(slug__in=slugs).delete()
print(f"deleted {deleted} existing demo products")


# Create categories (parents first)
cats_by_slug = {}
for name, slug, parent_slug in CATEGORIES:
    parent = cats_by_slug.get(parent_slug) if parent_slug else None
    cat, _ = Category.objects.update_or_create(
        slug=slug,
        defaults={"name": name, "parent": parent, "is_active": True},
    )
    cats_by_slug[slug] = cat
Category.objects.rebuild()
print(f"categories: {len(cats_by_slug)}")


# Create products
for name, slug, cat_slug, tpl_key, tpl_vars, variants, is_featured in P:
    desc = TEMPLATES[tpl_key].format(name=name, **tpl_vars)
    prod = Product.objects.create(
        name=name, slug=slug, description=desc,
        is_active=True, is_featured=is_featured,
    )
    prod.categories.set([cats_by_slug[cat_slug]])
    for vname, sku_tail, price, stock in variants:
        ProductVariant.objects.create(
            product=prod, name=vname,
            sku=f"{slug.upper().replace('-', '')}-{sku_tail}",
            price=price, stock=stock,
        )

print(f"products: {Product.objects.count()}")


# ─── Reviews ──────────────────────────────────────────────────────
# Varied names, ratings 3–5, varied length so the shop feels alive.

REVIEWER_NAMES = [
    "Alice T.", "Ben R.", "Charlie W.", "Dani M.", "Elena K.", "Fergus O.",
    "Grace H.", "Harvey P.", "Isla L.", "James F.", "Kiera B.", "Liam C.",
    "Mia D.", "Noah S.", "Olive J.", "Priya N.", "Quinn V.", "Rowan G.",
    "Sana A.", "Theo E.", "Uma Y.", "Victor Z.", "Will M.", "Xander R.",
    "Yasmin P.", "Zach K.", "Beatrice O.", "Cass L.", "Dev P.", "Eva S.",
    "Finn W.", "Gina R.", "Henry L.", "Imogen T.", "Jack B.", "Katya M.",
    "Leo F.", "Maya S.", "Nico D.", "Opal R.",
]

POS_TITLES = [
    "Properly good", "Back for seconds", "Fitzroy favourite",
    "Will be back", "Best lunch in town", "Hits the spot",
    "Finally, a decent dog", "", "", "",  # some blank titles
    "Student lunchtime staple", "Can't fault it", "Tenner well spent",
]

NEUTRAL_TITLES = [
    "Decent but busy", "Pricey for lunch", "Could use more sauce", "",
    "Good, not perfect",
]

POS_BODIES = [
    "Honestly, this is the best lunch I've had in Cambridge in ages. The sausage was juicy, the bun was fresh, and the staff were lovely. Will definitely be back.",
    "Grabbed one on the way to a lecture. Massive portion, properly hot, took me 15 minutes to walk off the heat. Worth every penny.",
    "I've been eating here since 2018. Nothing has dropped off. Still the same quality every single time.",
    "Loved it. Simple as that.",
    "Took my mates here after the match. All five of us ordered different things, all five of us finished them. That's a win.",
    "The brioche bun is the thing nobody talks about enough. Soft but holds together. Chef's kiss.",
    "Student special on a Thursday has basically saved my overdraft. Great value.",
    "Delicious. Quick. Not expensive. In Cambridge. A miracle.",
    "The Fitzroy Street cart is a proper institution now. If you haven't tried it, what are you doing?",
    "Perfectly cooked. Great flavour. Would recommend to anyone passing through.",
    "I'm picky and I'm hard to please. This place consistently nails it.",
    "Two of us shared the Family Pack. Zero complaints. Everything was hot, everything was fresh.",
    "The chilli cheese was so good I nearly ordered a second one. Restrained myself. Barely.",
    "Great food, great staff, great value. What more do you want from a hot dog stand?",
]

NEUTRAL_BODIES = [
    "Nice enough but the queue at lunchtime is brutal. Food was good when I finally got it.",
    "Flavour was spot on but I'd have liked a bit more sauce. Still good value overall.",
    "Decent. Not life-changing but definitely above average for street food.",
    "Good product. A bit on the pricier side for what it is, but I'd go again.",
    "The sausage was great, the bun was slightly cold. Minor thing, but worth mentioning.",
]

# Rating → (title pool, body pool)
RATING_POOLS = {
    5: (POS_TITLES, POS_BODIES),
    4: (POS_TITLES, POS_BODIES),
    3: (NEUTRAL_TITLES, NEUTRAL_BODIES),
}

# Weighted ratings: mostly 5s, some 4s, occasional 3s — feels real.
RATING_WEIGHTS = [(5, 0.55), (4, 0.30), (3, 0.15)]


def pick_rating():
    r = random.random()
    cumulative = 0.0
    for rating, weight in RATING_WEIGHTS:
        cumulative += weight
        if r <= cumulative:
            return rating
    return 5


# Wipe prior reviews on seeded products (idempotent)
Review.objects.filter(product__slug__in=slugs).delete()

review_count = 0
for prod in Product.objects.filter(slug__in=slugs):
    # 2–4 reviews per product
    n = random.randint(2, 4)
    chosen_names = random.sample(REVIEWER_NAMES, n)
    for name in chosen_names:
        rating = pick_rating()
        titles, bodies = RATING_POOLS[rating]
        Review.objects.create(
            product=prod,
            author_name=name,
            rating=rating,
            title=random.choice(titles),
            text=random.choice(bodies),
            is_approved=True,
        )
        review_count += 1

print(f"reviews: {review_count}")
print(f"\ndone — {Product.objects.count()} products, {Category.objects.count()} categories, {Review.objects.count()} approved reviews")
