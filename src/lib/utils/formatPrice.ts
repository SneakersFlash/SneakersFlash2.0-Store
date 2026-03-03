/**
 * Format a number as Indonesian Rupiah currency.
 * Adjust locale/currency to match your market.
 */
export function formatPrice(
  amount: number,
  options: {
    currency?: string;
    locale?: string;
    compact?: boolean;
  } = {}
): string {
  const { currency = "IDR", locale = "id-ID", compact = false } = options;

  if (compact && amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `Rp ${millions % 1 === 0 ? millions : millions.toFixed(1)}jt`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate discount percentage.
 */
export function discountPercent(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

/**
 * Format a number with thousand separators (no currency symbol).
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(amount);
}
