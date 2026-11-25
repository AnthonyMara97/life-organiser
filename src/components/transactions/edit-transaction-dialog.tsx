"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateTransaction } from "@/actions/transactions";
import type { TransactionFormState } from "@/actions/transactions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TransactionListRow } from "@/server/transactions";
import type { AccountOption, CategoryOption } from "@/server/transactions";

const initialState: TransactionFormState = { status: "idle" };

const fieldClass =
  "mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function dollars(cents: number): string {
  return (Math.abs(cents) / 100).toFixed(2);
}

type Props = {
  transaction: TransactionListRow;
  accounts: AccountOption[];
  categories: CategoryOption[];
};

/**
 * The edit dialog.
 *
 * Radix unmounts the content when it closes, so the form (and its action state)
 * is recreated on every open — no stale errors or stale values from a previous
 * transaction. The trigger stays in the table row.
 */
export function EditTransactionDialog({
  transaction,
  accounts,
  categories,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleSaved = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-ink-muted hover:bg-accent-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Edit
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit transaction</DialogTitle>
          <DialogDescription>
            Correct the amount, date, account or description. Changes are
            saved as confirmed.
          </DialogDescription>
        </DialogHeader>
        <EditForm
          transaction={transaction}
          accounts={accounts}
          categories={categories}
          onSaved={handleSaved}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  transaction,
  accounts,
  categories,
  onSaved,
}: Props & { onSaved: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateTransaction,
    initialState,
  );

  const [direction, setDirection] = useState<"out" | "in">(
    transaction.amountCents < 0 ? "out" : "in",
  );
  const wantedKind = direction === "out" ? "expense" : "income";
  const visibleCategories = categories.filter(
    (category) => category.kind === wantedKind,
  );
  const initialCategory =
    categories.find(
      (category) =>
        category.id === transaction.categoryId &&
        category.kind === wantedKind,
    )?.id ?? "";

  const savedAt = state.status === "success" ? state.savedAt : undefined;

  useEffect(() => {
    if (!savedAt) return;
    toast.success("Transaction updated");
    router.refresh();
    onSaved();
  }, [savedAt, onSaved, router]);

  const error = (field: string) => state.fieldErrors?.[field];
  const value = <K extends keyof NonNullable<TransactionFormState["values"]>>(
    key: K,
  ) => state.values?.[key];

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={transaction.id} />

      <label className="block text-xs font-medium text-ink-muted">
        Type
        <select
          name="direction"
          value={direction}
          onChange={(event) =>
            setDirection(event.target.value === "in" ? "in" : "out")
          }
          className={fieldClass}
        >
          <option value="out">Money out</option>
          <option value="in">Money in</option>
        </select>
      </label>

      <label className="block text-xs font-medium text-ink-muted">
        Amount
        <input
          name="amount"
          inputMode="decimal"
          autoComplete="off"
          required
          defaultValue={String(value("amount") ?? dollars(transaction.amountCents))}
          aria-invalid={error("amount") ? true : undefined}
          className={fieldClass}
        />
        {error("amount") ? (
          <span role="alert" className="mt-1 block text-xs text-danger">
            {error("amount")}
          </span>
        ) : null}
      </label>

      <label className="block text-xs font-medium text-ink-muted">
        Date
        <input
          type="date"
          name="occurredOn"
          required
          defaultValue={String(value("occurredOn") ?? transaction.occurredOn)}
          aria-invalid={error("occurredOn") ? true : undefined}
          className={fieldClass}
        />
        {error("occurredOn") ? (
          <span role="alert" className="mt-1 block text-xs text-danger">
            {error("occurredOn")}
          </span>
        ) : null}
      </label>

      <label className="block text-xs font-medium text-ink-muted">
        Account
        <select
          name="accountId"
          required
          defaultValue={String(value("accountId") ?? transaction.accountId)}
          aria-invalid={error("accountId") ? true : undefined}
          className={fieldClass}
        >
          <option value="" disabled>
            Choose an account
          </option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
              {account.archived ? " (archived)" : ""}
            </option>
          ))}
        </select>
        {error("accountId") ? (
          <span role="alert" className="mt-1 block text-xs text-danger">
            {error("accountId")}
          </span>
        ) : null}
      </label>

      <label className="block text-xs font-medium text-ink-muted sm:col-span-2">
        Category
        <select
          key={wantedKind}
          name="categoryId"
          required
          defaultValue={String(value("categoryId") ?? initialCategory)}
          aria-invalid={error("categoryId") ? true : undefined}
          className={fieldClass}
        >
          <option value="" disabled>
            Choose a category
          </option>
          {visibleCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {category.archived ? " (archived)" : ""}
            </option>
          ))}
        </select>
        {error("categoryId") ? (
          <span role="alert" className="mt-1 block text-xs text-danger">
            {error("categoryId")}
          </span>
        ) : null}
      </label>

      <label className="block text-xs font-medium text-ink-muted sm:col-span-2">
        Description
        <input
          name="description"
          maxLength={200}
          required
          defaultValue={String(value("description") ?? transaction.description)}
          aria-invalid={error("description") ? true : undefined}
          className={fieldClass}
        />
        {error("description") ? (
          <span role="alert" className="mt-1 block text-xs text-danger">
            {error("description")}
          </span>
        ) : null}
      </label>

      {state.message ? (
        <p role="alert" className="text-sm text-danger sm:col-span-2">
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
