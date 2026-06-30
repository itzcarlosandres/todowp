import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";

const locales = { es, en: enUS };

export function formatDate(
  date: Date | string | null | undefined,
  pattern = "PPP",
  locale: "es" | "en" = "es",
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: locales[locale] });
}

export function formatRelativeDate(
  date: Date | string | null | undefined,
  locale: "es" | "en" = "es",
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: locales[locale] });
}
