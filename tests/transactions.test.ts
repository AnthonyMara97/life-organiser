import { describe, expect, it } from "vitest";

import { expenseInputSchema, transactionInputSchema } from "../src/lib/validation/transactions";

const valid = {
  amount: "12.35",
  occurredOn: "2026-11-24",
  accountId: "account_1",
  categoryId: "category_1",
  description: "Coffee",
};

describe("expenseInputSchema", () => {
  it("accepts a complete expense", () => {
    expect(expenseInputSchema.safeParse(valid).success).toBe(true);
  });

  it("trims the description", () => {
    const parsed = expenseInputSchema.parse({ ...valid, description: "  Lunch  " });
    expect(parsed.description).toBe("Lunch");
  });

  it("rejects a day that does not exist", () => {
    expect(
      expenseInputSchema.safeParse({ ...valid, occurredOn: "2026-02-30" })
        .success,
    ).toBe(false);
  });

  it("rejects a date in the wrong shape", () => {
    expect(
      expenseInputSchema.safeParse({ ...valid, occurredOn: "24/11/2026" })
        .success,
    ).toBe(false);
  });

  it("rejects a blank description", () => {
    expect(
      expenseInputSchema.safeParse({ ...valid, description: "   " }).success,
    ).toBe(false);
  });

  it("rejects a description over 200 characters", () => {
    expect(
      expenseInputSchema.safeParse({
        ...valid,
        description: "x".repeat(201),
      }).success,
    ).toBe(false);
  });

  it("requires an account and a category", () => {
    expect(
      expenseInputSchema.safeParse({ ...valid, accountId: "" }).success,
    ).toBe(false);
    expect(
      expenseInputSchema.safeParse({ ...valid, categoryId: "" }).success,
    ).toBe(false);
  });
});

describe("transactionInputSchema", () => {
  const editing = { ...valid, id: "tx_1", direction: "out" };

  it("accepts a complete edit", () => {
    expect(transactionInputSchema.safeParse(editing).success).toBe(true);
    expect(
      transactionInputSchema.safeParse({ ...editing, direction: "in" }).success,
    ).toBe(true);
  });

  it("requires the row being edited", () => {
    expect(
      transactionInputSchema.safeParse({ ...editing, id: "" }).success,
    ).toBe(false);
  });

  it("rejects a direction that is neither in nor out", () => {
    expect(
      transactionInputSchema.safeParse({ ...editing, direction: "sideways" })
        .success,
    ).toBe(false);
  });
});
