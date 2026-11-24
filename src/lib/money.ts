/**
 * Money formatting.
 *
 * Amounts are signed integer cents everywhere (D4): $12.35 is `1235`, and a
 * negative number is money out. Division by 100 happens here, at the render
 * edge, and nowhere else — that is the whole point of keeping the storage
 * integral.
 */

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

export function formatCents(cents: number): string {
  if (!Number.isInteger(cents)) {
    throw new Error(`Expected whole cents, received ${cents}`);
  }

  return AUD.format(cents / 100);
}
