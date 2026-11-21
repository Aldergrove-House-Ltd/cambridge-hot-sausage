import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { namespaces } from "./namespaces";
import { routing } from "./routing";

async function loadMessages(locale: string) {
  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      const mod = await import(`../messages/${locale}/${ns}.json`);
      return [ns, mod.default] as const;
    }),
  );
  return Object.fromEntries(entries);
}

type Messages = Record<string, unknown>;

function isPlainObject(value: unknown): value is Messages {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Locale strings win; any key a locale hasn't translated yet falls back to
// the default locale, so new copy shows in English instead of a raw key path.
function withFallback(base: Messages, override: Messages): Messages {
  const result: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = base[key];
    result[key] =
      isPlainObject(baseValue) && isPlainObject(value)
        ? withFallback(baseValue, value)
        : value;
  }
  return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = await loadMessages(locale);

  return {
    locale,
    messages:
      locale === routing.defaultLocale
        ? messages
        : withFallback(await loadMessages(routing.defaultLocale), messages),
  };
});
