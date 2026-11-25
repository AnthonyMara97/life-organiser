"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseCents } from "@/lib/money";
import {
  expenseInputSchema,
  transactionIdSchema,
  transactionInputSchema,
} from "@/lib/validation/transactions";
import { liveTransactionWhere } from "@/server/transactions";

export type TransactionFormValues = {
  id?: string;
  amount: string;
  direction?: "out" | "in";
  occurredOn: string;
  accountId: string;
  categoryId: string;
  description: string;
};

export type TransactionFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: TransactionFormValues;
  /** Set only on success, so the edit dialog can close once and not on every render. */
  savedAt?: number;
};

export type ActionResult = { ok: true } | { ok: false; message: string };

function fieldErrorsFrom(issues: readonly { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

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
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
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

/**
 * Corrects an existing row.
 *
 * Archived accounts and categories are allowed here even though the quick-add
 * form refuses them: a row filed in August against an account closed in
 * September must remain fixable. The category is still required to match the
 * direction, because an expense filed under an income category breaks every
 * total it touches.
 */
export async function updateTransaction(
  _previousState: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const session = await auth();
  const householdId = session?.user?.householdId;

  const values: TransactionFormValues = {
    id: String(formData.get("id") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    direction: formData.get("direction") === "in" ? "in" : "out",
    occurredOn: String(formData.get("occurredOn") ?? ""),
    accountId: String(formData.get("accountId") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  if (!householdId) {
    return {
      status: "error",
      message: "Your session expired. Sign in again.",
      values,
    };
  }

  const parsed = transactionInputSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
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

  const kind = parsed.data.direction === "out" ? "expense" : "income";

  const [account, category] = await Promise.all([
    db.account.findFirst({
      where: { id: parsed.data.accountId, householdId },
      select: { id: true },
    }),
    db.category.findFirst({
      where: { id: parsed.data.categoryId, householdId, kind },
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
        categoryId:
          kind === "expense"
            ? "Choose one of the household's expense categories"
            : "Choose one of the household's income categories",
      },
      values,
    };
  }

  // updateMany scopes the row and the soft-delete check in the same statement:
  // a row deleted in another tab cannot be edited back to life by a stale form.
  const updated = await db.transaction.updateMany({
    where: { id: parsed.data.id, ...liveTransactionWhere(householdId) },
    data: {
      accountId: account.id,
      categoryId: category.id,
      amountCents: parsed.data.direction === "out" ? -amountCents : amountCents,
      occurredOn: new Date(`${parsed.data.occurredOn}T00:00:00.000Z`),
      description: parsed.data.description,
    },
  });

  if (updated.count === 0) {
    return {
      status: "error",
      message: "That transaction no longer exists. Refresh the list.",
      values,
    };
  }

  revalidatePath("/transactions");
  return { status: "success", savedAt: Date.now(), values };
}

/**
 * Deletes a transaction by setting `deletedAt` (D27).
 *
 * Nothing leaves the table, so the undo is an update and still works after a
 * reload. The ten seconds is the toast's lifetime, not a timer holding the row
 * hostage; a delete that is never undone simply stays soft-deleted.
 */
export async function deleteTransaction(id: string): Promise<ActionResult> {
  const session = await auth();
  const householdId = session?.user?.householdId;

  if (!householdId) {
    return { ok: false, message: "Your session expired. Sign in again." };
  }

  const parsed = transactionIdSchema.safeParse(id);
  if (!parsed.success) {
    return { ok: false, message: "That transaction could not be found." };
  }

  const deleted = await db.transaction.updateMany({
    where: { id: parsed.data, ...liveTransactionWhere(householdId) },
    data: { deletedAt: new Date() },
  });

  if (deleted.count === 0) {
    return { ok: false, message: "That transaction is already gone." };
  }

  revalidatePath("/transactions");
  return { ok: true };
}

/**
 * Puts a soft-deleted transaction back.
 *
 * The `deletedAt: not null` condition is what makes this a one-way repair: it
 * cannot be used to reach a row that was never deleted, and it is idempotent if
 * the undo button is pressed twice.
 */
export async function undoDeleteTransaction(id: string): Promise<ActionResult> {
  const session = await auth();
  const householdId = session?.user?.householdId;

  if (!householdId) {
    return { ok: false, message: "Your session expired. Sign in again." };
  }

  const parsed = transactionIdSchema.safeParse(id);
  if (!parsed.success) {
    return { ok: false, message: "That transaction could not be found." };
  }

  const restored = await db.transaction.updateMany({
    where: {
      id: parsed.data,
      householdId,
      deletedAt: { not: null },
    },
    data: { deletedAt: null },
  });

  if (restored.count === 0) {
    return { ok: false, message: "Nothing to restore." };
  }

  revalidatePath("/transactions");
  return { ok: true };
}
