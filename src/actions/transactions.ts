"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseCents } from "@/lib/money";
import { expenseInputSchema } from "@/lib/validation/transactions";

export type TransactionFormValues = {
  amount: string;
  occurredOn: string;
  accountId: string;
  categoryId: string;
  description: string;
};

export type TransactionFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: TransactionFormValues;
};

/**
 * Creates a manual expense.
 *
 * The client sends the form; the server re-derives everything it can. The
 * household comes from the session, the account and category are re-checked
 * against that household, and the amount is parsed here rather than trusted as
 * a number from the browser.
 */
export async function createExpense(
  _previousState: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const session = await auth();
  const householdId = session?.user?.householdId;
  const userId = session?.user?.id;

  const values: TransactionFormValues = {
    amount: String(formData.get("amount") ?? ""),
    occurredOn: String(formData.get("occurredOn") ?? ""),
    accountId: String(formData.get("accountId") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  if (!householdId || !userId) {
    return {
      status: "error",
      message: "Your session expired. Sign in again.",
      values,
    };
  }

  const parsed = expenseInputSchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }

    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors,
      values,
    };
  }

  let amountCents: number;
  try {
    amountCents = parseCents(parsed.data.amount);
  } catch (error) {
    return {
      status: "error",
      fieldErrors: {
        amount:
          error instanceof Error ? error.message : "Enter a valid amount",
      },
      values,
    };
  }

  const [account, category] = await Promise.all([
    db.account.findFirst({
      where: {
        id: parsed.data.accountId,
        householdId,
        archivedAt: null,
      },
      select: { id: true },
    }),
    db.category.findFirst({
      where: {
        id: parsed.data.categoryId,
        householdId,
        kind: "expense",
        archivedAt: null,
      },
      select: { id: true },
    }),
  ]);

  if (!account) {
    return {
      status: "error",
      fieldErrors: { accountId: "Choose one of the household's accounts" },
      values,
    };
  }
  if (!category) {
    return {
      status: "error",
      fieldErrors: {
        categoryId: "Choose one of the household's expense categories",
      },
      values,
    };
  }

  await db.transaction.create({
    data: {
      householdId,
      accountId: account.id,
      categoryId: category.id,
      // The form takes a positive dollars amount; money out is stored negative.
      amountCents: -amountCents,
      occurredOn: new Date(`${parsed.data.occurredOn}T00:00:00.000Z`),
      description: parsed.data.description,
      status: "confirmed",
      source: "manual",
      createdById: userId,
    },
  });

  revalidatePath("/transactions");
  redirect(`/transactions?month=${parsed.data.occurredOn.slice(0, 7)}`);
}
