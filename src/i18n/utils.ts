import type { AppLocale } from "./routing";

export function hasLocale(
  locales: readonly AppLocale[],
  locale: unknown
): locale is AppLocale {
  return typeof locale === "string" && (locales as readonly string[]).includes(locale);
}
