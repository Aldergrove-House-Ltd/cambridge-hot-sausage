from pathlib import Path

from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Security ────────────────────────────────────────────────────

SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="", cast=Csv())

# ── Apps ────────────────────────────────────────────────────────

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "storages",
    "rest_framework",
    "django_filters",
    "corsheaders",
    "mptt",
    # Local
    "shop.apps.ShopConfig",
    "orders.apps.OrdersConfig",
    "contact.apps.ContactConfig",
    "newsletter.apps.NewsletterConfig",
    "events.apps.EventsConfig",
    "authentication.apps.AuthenticationConfig",
]

# ── Middleware ───────────────────────────────────────────────────

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ── URL / WSGI ──────────────────────────────────────────────────

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# ── Templates ───────────────────────────────────────────────────

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ── Database ────────────────────────────────────────────────────
# SQLite for dev, PostgreSQL for prod.

_database_url = config("DATABASE_URL", default="")

if _database_url:
    # Production: parse DATABASE_URL for PostgreSQL
    import re

    _m = re.match(
        r"postgres(?:ql)?://(?P<user>[^:]+):(?P<pass>[^@]+)@(?P<host>[^:]+):(?P<port>\d+)/(?P<name>.+)",
        _database_url,
    )
    if not _m:
        raise ValueError("DATABASE_URL must be postgres://user:pass@host:port/dbname")

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": _m.group("name"),
            "USER": _m.group("user"),
            "PASSWORD": _m.group("pass"),
            "HOST": _m.group("host"),
            "PORT": _m.group("port"),
            "CONN_MAX_AGE": 600,
            "CONN_HEALTH_CHECKS": True,
            "OPTIONS": {"connect_timeout": 5},
        }
    }
else:
    _sqlite_path = config("SQLITE_PATH", default="")
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": _sqlite_path if _sqlite_path else BASE_DIR / "db.sqlite3",
        }
    }

# ── Cache ───────────────────────────────────────────────────────
# LocMemCache for dev, Redis for prod.

_redis_url = config("REDIS_URL", default="")

if _redis_url:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": _redis_url,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            },
            "KEY_PREFIX": "chs",
            "TIMEOUT": 60 * 15,  # 15 minutes default
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "chs-dev",
            "TIMEOUT": 60 * 15,
        }
    }

# ── Password validation ────────────────────────────────────────

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ── Internationalization ────────────────────────────────────────

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ── Static & Media ──────────────────────────────────────────────

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

# ── Object Storage (Railway Bucket / S3-compatible) ─────────────

_bucket_endpoint = config("BUCKET_ENDPOINT", default="")

if _bucket_endpoint:
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
            "OPTIONS": {
                "endpoint_url": _bucket_endpoint,
                "access_key": config("BUCKET_ACCESS_KEY"),
                "secret_key": config("BUCKET_SECRET_KEY"),
                "bucket_name": config("BUCKET_NAME"),
                "default_acl": "private",
                "querystring_auth": True,
                "querystring_expire": 3600,
                "file_overwrite": False,
            },
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }

# ── Default primary key ────────────────────────────────────────

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── CORS ────────────────────────────────────────────────────────

CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", default="", cast=Csv())
CORS_ALLOW_CREDENTIALS = True

if any(o.strip() == "*" for o in CORS_ALLOWED_ORIGINS):
    from django.core.exceptions import ImproperlyConfigured
    raise ImproperlyConfigured(
        "CORS_ALLOWED_ORIGINS cannot contain '*' while CORS_ALLOW_CREDENTIALS=True."
    )

# ── Django REST Framework ───────────────────────────────────────

REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 24,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ]
    + (["rest_framework.renderers.BrowsableAPIRenderer"] if DEBUG else []),
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/minute",
        "user": "120/minute",
    },
    # Public endpoints are the default and never need DRF to touch the
    # Django session. Admin viewsets opt into SessionAuthentication
    # explicitly, which also opts them into DRF's CSRF enforcement.
    # Keeping SessionAuthentication global causes an admin session
    # cookie (in the same browser) to force CSRF on every public POST.
    "DEFAULT_AUTHENTICATION_CLASSES": [],
}

# ── Session & CSRF ──────────────────────────────────────────────

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_TRUSTED_ORIGINS = config("CSRF_TRUSTED_ORIGINS", default="http://localhost:3000", cast=Csv())

# ── Stripe ──────────────────────────────────────────────────────

STRIPE_SECRET_KEY = config("STRIPE_SECRET_KEY", default="")
STRIPE_WEBHOOK_SECRET = config("STRIPE_WEBHOOK_SECRET", default="")
FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:3000")

# ── Security hardening (prod only) ─────────────────────────────

if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
    # SSL redirect disabled — Railway/Vercel handle SSL at the proxy level.
    # Enabling this causes infinite redirect loops behind reverse proxies.
    SECURE_SSL_REDIRECT = False
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
