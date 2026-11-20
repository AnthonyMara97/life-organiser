import { describe, expect, it } from "vitest";

import { isAllowedEmail, parseAllowlist } from "../src/lib/allowlist";

describe("parseAllowlist", () => {
  it("splits on commas and ignores surrounding spaces", () => {
    expect(parseAllowlist("a@example.com, b@example.com")).toEqual([
      "a@example.com",
      "b@example.com",
    ]);
  });

  it("normalises case", () => {
    expect(parseAllowlist("Anthony@Example.COM")).toEqual([
      "anthony@example.com",
    ]);
  });

  it("treats a missing or blank value as an empty list", () => {
    expect(parseAllowlist(undefined)).toEqual([]);
    expect(parseAllowlist("")).toEqual([]);
    expect(parseAllowlist("  ,  , ")).toEqual([]);
  });
});

describe("isAllowedEmail", () => {
  const allowlist = "anthony@example.com, wife@example.com";

  it("admits an address on the list, whatever its case", () => {
    expect(isAllowedEmail("anthony@example.com", allowlist)).toBe(true);
    expect(isAllowedEmail("Wife@Example.com", allowlist)).toBe(true);
  });

  it("rejects an address that is not on the list", () => {
    expect(isAllowedEmail("stranger@example.com", allowlist)).toBe(false);
  });

  it("rejects a lookalike that only shares a prefix or suffix", () => {
    expect(isAllowedEmail("anthony@example.com.au", allowlist)).toBe(false);
    expect(isAllowedEmail("notanthony@example.com", allowlist)).toBe(false);
  });

  it("rejects everyone when the allowlist is empty or missing", () => {
    expect(isAllowedEmail("anthony@example.com", "")).toBe(false);
    expect(isAllowedEmail("anthony@example.com", undefined)).toBe(false);
  });

  it("rejects a missing or blank email even with a populated allowlist", () => {
    expect(isAllowedEmail(undefined, allowlist)).toBe(false);
    expect(isAllowedEmail(null, allowlist)).toBe(false);
    expect(isAllowedEmail("   ", allowlist)).toBe(false);
  });
});
