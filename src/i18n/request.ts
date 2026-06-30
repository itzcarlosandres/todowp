// Force reload of i18n messages
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "./utils";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: "UTC",
    now: new Date(),
    formats: {
      dateTime: {
        short: { day: "numeric", month: "short", year: "numeric" },
        medium: { day: "numeric", month: "long", year: "numeric" },
        long: { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric" },
      },
    },
  };
});
