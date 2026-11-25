"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  deleteTransaction,
  undoDeleteTransaction,
} from "@/actions/transactions";
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog";
import { formatDayLabel } from "@/lib/dates";
import { formatCents } from "@/lib/money";
import type {
  AccountOption,
  CategoryOption,
  TransactionListRow,
} from "@/server/transactions";

type OptimisticAction =
  | { type: "delete"; id: string; index: number }
  | { type: "restore"; row: TransactionListRow; index: number };

/**
 * The list, with the delete made optimistic.
 *
 * The row disappears the moment the button is pressed, before the server has
 * answered, because a delete that waits for a round trip feels broken on a
 * phone. The server is still the authority: if the action fails, the row comes
 * back on the next render and the toast says why.
 *
 * The undo is the same trick in reverse. `deletedAt` was never a countdown in
 * the browser — the row is soft-deleted immediately and this only puts the
 * index back in the local view for the seconds the toast is visible.
 */
function reduce(
  state: TransactionListRow[],
  action: OptimisticAction,
): TransactionListRow[] {
  if (action.type === "delete") {
    return state.filter((row) => row.id !== action.id);
  }

  // If the refresh carrying the row back has already arrived, the optimistic
  // insert would duplicate it (and a duplicate key in React is a real warning).
  if (state.some((row) => row.id === action.row.id)) {
    return state;
  }

  const next = state.slice();
  next.splice(Math.min(action.index, next.length), 0, action.row);
  return next;
}

type Props = {
  rows: TransactionListRow[];
  accounts: AccountOption[];
  categories: CategoryOption[];
};

function RowActions({
  row,
  index,
  accounts,
  categories,
  onDelete,
  disabled,
}: {
  row: TransactionListRow;
  index: number;
  accounts: AccountOption[];
  categories: CategoryOption[];
  onDelete: (row: TransactionListRow, index: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex justify-end gap-1">
      <EditTransactionDialog
        transaction={row}
        accounts={accounts}
        categories={categories}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onDelete(row, index)}
        aria-label={`Delete ${row.description}`}
        className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-ink-muted hover:border-danger-line hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}

export function TransactionTable({ rows, accounts, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticRows, applyOptimistic] = useOptimistic(rows, reduce);

  const handleDelete = (row: TransactionListRow, index: number) => {
    startTransition(async () => {
      applyOptimistic({ type: "delete", id: row.id, index });

      const result = await deleteTransaction(row.id);

      if (!result.ok) {
        toast.error(result.message);
        router.refresh();
        return;
      }

      toast("Transaction deleted", {
        description: `${row.description} · ${formatCents(row.amountCents)}`,
        duration: 10_000,
        action: {
          label: "Undo",
          onClick: () => {
            startTransition(async () => {
              applyOptimistic({ type: "restore", row, index });

              const restored = await undoDeleteTransaction(row.id);

              if (restored.ok) {
                toast.success("Transaction restored");
              } else {
                toast.error(restored.message);
              }

              router.refresh();
            });
          },
        },
      });

      router.refresh();
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="min-w-full text-sm">
        <caption className="sr-only">Transactions for this month</caption>
        <thead>
          <tr className="border-b border-line text-left text-xs text-ink-muted">
            <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">
              Date
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Description
            </th>
            <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">
              Category
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Amount
            </th>
            <th scope="col" className="hidden px-4 py-3 text-right font-medium md:table-cell">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {optimisticRows.map((row, index) => (
            <tr key={row.id} className="border-b border-line last:border-0">
              <td className="whitespace-nowrap px-4 py-3 align-top text-ink-muted">
                {formatDayLabel(row.occurredOn)}
              </td>
              <td className="px-4 py-3 align-top">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-ink">{row.description}</span>
                  {row.status === "needs_review" ? (
                    <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-muted">
                      Needs review
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {row.merchant ? `${row.merchant} · ` : ""}
                  {row.categoryName} · {row.accountName}
                </p>
                {/* On a phone the action column is off the right edge, so the
                    same controls sit under the description instead. The
                    desktop copy is hidden below `md` and this one above it, so
                    only one is ever focusable. */}
                <div className="mt-2 md:hidden">
                  <RowActions
                    row={row}
                    index={index}
                    accounts={accounts}
                    categories={categories}
                    onDelete={handleDelete}
                    disabled={isPending}
                  />
                </div>
              </td>
              <td className="hidden px-4 py-3 align-top text-ink-muted md:table-cell">
                {row.categoryName}
              </td>
              <td
                className={`whitespace-nowrap px-4 py-3 text-right align-top tabular-nums ${
                  row.amountCents < 0 ? "text-danger" : "text-ink"
                }`}
              >
                {formatCents(row.amountCents)}
              </td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-right align-top md:table-cell">
                <RowActions
                  row={row}
                  index={index}
                  accounts={accounts}
                  categories={categories}
                  onDelete={handleDelete}
                  disabled={isPending}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
