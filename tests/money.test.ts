import { describe, expect, it } from "vitest";

import { formatCents } from "../src/lib/money";

describe("formatCents", () => {
  it("renders integer cents as AUD", () => {
    expect(formatCents(1235)).toBe("$12.35");
    expect(formatCents(0)).toBe("$0.00");
    expect(formatCents(100000)).toBe("$1,000.00");
  });

  it("keeps the sign for money out", () => {
    expect(formatCents(-1235)).toBe("-$12.35");
  });

  it("refuses a fractional number of cents", () => {
    expect(() => formatCents(12.35)).toThrow(/whole cents/);
  });
});
