import { describe, expect, it } from "vitest";

import {
  categoryArchiveSchema,
  categoryInputSchema,
  categoryRenameSchema,
} from "../src/lib/validation/categories";

describe("categoryInputSchema", () => {
  it("accepts a top-level category", () => {
    const parsed = categoryInputSchema.parse({
      name: "Groceries",
      kind: "expense",
      parentId: "",
    });

    expect(parsed.parentId).toBeUndefined();
  });

  it("keeps a real parent id", () => {
    const parsed = categoryInputSchema.parse({
      name: "Fruit",
      kind: "expense",
      parentId: "category_1",
    });

    expect(parsed.parentId).toBe("category_1");
  });

  it("turns a whitespace-only parent into no parent", () => {
    expect(
      categoryInputSchema.parse({
        name: "Fruit",
        kind: "expense",
        parentId: "   ",
      }).parentId,
    ).toBeUndefined();
  });

  it("trims the name", () => {
    expect(
      categoryInputSchema.parse({
        name: "  Eating out  ",
        kind: "expense",
        parentId: "",
      }).name,
    ).toBe("Eating out");
  });

  it("rejects a blank name", () => {
    expect(
      categoryInputSchema.safeParse({
        name: "   ",
        kind: "expense",
        parentId: "",
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown kind", () => {
    expect(
      categoryInputSchema.safeParse({
        name: "Groceries",
        kind: "transfer",
        parentId: "",
      }).success,
    ).toBe(false);
  });
});

describe("categoryRenameSchema", () => {
  it("accepts an id and a name", () => {
    expect(
      categoryRenameSchema.safeParse({ id: "category_1", name: "Food" }).success,
    ).toBe(true);
  });

  it("requires the id", () => {
    expect(
      categoryRenameSchema.safeParse({ id: "", name: "Food" }).success,
    ).toBe(false);
  });
});

describe("categoryArchiveSchema", () => {
  it("accepts the strings a form actually sends", () => {
    expect(
      categoryArchiveSchema.safeParse({ id: "category_1", archived: "true" })
        .success,
    ).toBe(true);
    expect(
      categoryArchiveSchema.safeParse({ id: "category_1", archived: "false" })
        .success,
    ).toBe(true);
  });

  it("rejects a missing value, which would otherwise restore by accident", () => {
    expect(
      categoryArchiveSchema.safeParse({ id: "category_1", archived: "" })
        .success,
    ).toBe(false);
  });
});
