/**
 * Formatea un precio con la moneda y locale especificados.
 */
export function formatPrice(
  amount: number | string | null | undefined,
  options: {
    currency?: string;
    locale?: string;
    showSign?: boolean;
  } = {},
): string {
  const { currency = "USD", locale = "es-ES", showSign = false } = options;

  if (amount === null || amount === undefined) return "—";

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "—";

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formatted = formatter.format(num);
  if (showSign && num > 0) return `+${formatted}`;
  return formatted;
}

/**
 * Formatea un número compacto: 1234 -> 1.2K
 */
export function formatCompactNumber(num: number, locale = "es-ES"): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Calcula el porcentaje de descuento
 */
export function discountPercent(price: number, salePrice: number): number {
  if (price <= 0 || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}
