import { z } from "zod";

import { addDays } from "@/lib/dates";

/**
 * The quick-add expense form, validated on the server.
 *
 * The browser gets the same shape through the form, but the server is the one
 * that decides: a request can arrive without JavaScript, with edited HTML, or
 * from curl. The schema is the boundary.
 */
export const expenseInputSchema = z.object({
  amount: z.string().trim().min(1, "Enter an amount"),
  occurredOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-11-24")
    .refine((value) => {
      try {
        // The date helpers reject impossible days (2026-02-30) instead of
        // letting Date roll them into March.
        addDays(value, 0);
        return true;
      } catch {
        return false;
      }
    }, "That date does not exist"),
  accountId: z.string().min(1, "Choose an account"),
  categoryId: z.string().min(1, "Choose a category"),
  description: z
    .string()
    .trim()
    .min(1, "Add a short description")
    .max(200, "Keep it under 200 characters"),
});

export type ExpenseInput = z.infer<typeof expenseInputSchema>;
