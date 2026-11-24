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

/**
 * Parses a user-entered amount into positive integer cents.
 *
 * The form takes dollars ("12.35"); the database takes cents (1235). Doing the
 * conversion here, once, keeps the rule out of every caller. A third decimal is
 * rejected rather than rounded: silently losing a cent is worse than asking the
 * user to fix the number.
 */
export function parseCents(input: string): number {
  const cleaned = input.trim().replace(/^\$/, "");

  if (!/^(\d{1,3}(,\d{3})*|\d+)(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error("Enter an amount like 12.35");
  }

  const [dollars, fraction = ""] = cleaned.replace(/,/g, "").split(".");
  const cents = Number(dollars) * 100 + Number(fraction.padEnd(2, "0"));

  if (!Number.isSafeInteger(cents)) {
    throw new Error("That amount is too large");
  }
  if (cents <= 0) {
    throw new Error("Amount must be more than zero");
  }

  return cents;
}
