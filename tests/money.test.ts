import { describe, expect, it } from "vitest";

import { formatCents, parseCents } from "../src/lib/money";

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

describe("parseCents", () => {
  it("parses the shapes people actually type", () => {
    expect(parseCents("12.35")).toBe(1235);
    expect(parseCents("12.3")).toBe(1230);
    expect(parseCents("12")).toBe(1200);
    expect(parseCents("$1,234.56")).toBe(123456);
    expect(parseCents("0.01")).toBe(1);
    expect(parseCents("  8.40  ")).toBe(840);
  });

  it("refuses a third decimal rather than rounding", () => {
    expect(() => parseCents("12.345")).toThrow(/like 12.35/);
  });

  it("refuses zero, negatives and nonsense", () => {
    expect(() => parseCents("0")).toThrow(/more than zero/);
    expect(() => parseCents("-5")).toThrow(/like 12.35/);
    expect(() => parseCents("abc")).toThrow(/like 12.35/);
    expect(() => parseCents("")).toThrow(/like 12.35/);
    expect(() => parseCents("1,23")).toThrow(/like 12.35/);
  });

  it("refuses an amount beyond safe integer cents", () => {
    expect(() => parseCents("9007199254740992")).toThrow(/too large/);
  });
});
