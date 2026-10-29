import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except:
  //   - API + admin routes (incl. Django's /django-admin/)
  //   - Backend-proxied asset paths (/media/, /static/)
  //   - Next internals and Vercel preview routes
  //   - Any path with a dot (regular static assets like .jpg, .css, .txt)
  //   - Root-level Next metadata routes (opengraph-image, icon, apple-icon,
  //     sitemap, robots) — they're served at fixed paths and must NOT be
  //     locale-prefixed.
  matcher:
    "/((?!api|admin|django-admin|media|static|_next|_vercel|opengraph-image|twitter-image|icon|apple-icon|sitemap|robots|llms|ai|.*\\..*).*)",
};
