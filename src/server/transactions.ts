import type { Prisma } from "@prisma/client";

import { isoDay, monthBounds } from "@/lib/dates";
import { db } from "@/lib/db";

/**
 * The transactions list for one month.
 *
 * The household id is passed in by the caller, which reads it from the session
 * — never from the URL or a form field. Every query below filters on it, so a
 * malformed request can only show the caller's own household.
 */

/**
 * The one filter every transaction read starts from (D27).
 *
 * Deleting a row sets `deletedAt`; the row stays in the table so the undo is an
 * update and survives a reload. That only holds if no read forgets the filter,
 * so there is exactly one place it is written and every query spreads this.
 * A new query that does not start here is a bug: it will count deleted rows.
 */
export function liveTransactionWhere(
  householdId: string,
): Prisma.TransactionWhereInput {
  return { householdId, deletedAt: null };
}

export type TransactionStatusFilter = "needs_review" | "confirmed";

export type TransactionFilters = {
  accountId?: string;
  categoryId?: string;
  status?: TransactionStatusFilter;
  query?: string;
};

export type TransactionListRow = {
  id: string;
  occurredOn: string;
  description: string;
  merchant: string | null;
  amountCents: number;
  status: "needs_review" | "confirmed";
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
};

export type TransactionListResult = {
  rows: TransactionListRow[];
  totalCount: number;
  totalCents: number;
  page: number;
  pageCount: number;
};

const DEFAULT_PAGE_SIZE = 20;

export async function listTransactionsForMonth(
  householdId: string,
  month: string,
  requestedPage: number,
  filters: TransactionFilters = {},
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<TransactionListResult> {
  const { start, end } = monthBounds(month);

  // `occurredOn` is a @db.Date. Prisma compares it as a Date at UTC midnight,
  // which is exactly the calendar day we mean; no time zone is involved.
  const occurredOn = {
    gte: new Date(`${start}T00:00:00.000Z`),
    lte: new Date(`${end}T00:00:00.000Z`),
  };

  const search = filters.query?.trim();
  const where: Prisma.TransactionWhereInput = {
    ...liveTransactionWhere(householdId),
    occurredOn,
    ...(filters.accountId ? { accountId: filters.accountId } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    // Free text searches the three readable text columns. `insensitive` is what
    // makes "woolworths" find "Woolworths Metro"; Postgres does the work, not
    // JavaScript, so pagination and the total stay correct.
    ...(search
      ? {
          OR: [
            { description: { contains: search, mode: "insensitive" as const } },
            { merchant: { contains: search, mode: "insensitive" as const } },
            { note: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [totalCount, aggregate] = await Promise.all([
    db.transaction.count({ where }),
    db.transaction.aggregate({ where, _sum: { amountCents: true } }),
  ]);

  // Clamp rather than 404: a bookmarked page 9 of a month that now has two
  // pages should land on the last page, not an error.
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(Math.max(requestedPage, 1), pageCount);

  const rows = await db.transaction.findMany({
    where,
    orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      occurredOn: true,
      description: true,
      merchant: true,
      amountCents: true,
      status: true,
      accountId: true,
      categoryId: true,
      account: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  return {
    rows: rows.map((row) => ({
      id: row.id,
      occurredOn: isoDay(row.occurredOn),
      description: row.description,
      merchant: row.merchant,
      amountCents: row.amountCents,
      status: row.status,
      accountId: row.accountId,
      accountName: row.account.name,
      categoryId: row.categoryId,
      categoryName: row.category.name,
    })),
    totalCount,
    totalCents: aggregate._sum.amountCents ?? 0,
    page,
    pageCount,
  };
}

export type AccountOption = { id: string; name: string; archived: boolean };
export type CategoryOption = {
  id: string;
  name: string;
  kind: "income" | "expense";
  archived: boolean;
};

/**
 * Every choice the filters, the edit dialog and the quick-add form need.
 *
 * Archived rows are included, with a flag rather than filtered out: a
 * transaction from two months ago may point at an account or category that was
 * archived since, and it must still be readable, editable and findable. The
 * quick-add form is the one caller that filters them out, because a new row
 * should not be filed against a closed account.
 */
export async function getTransactionOptions(
  householdId: string,
): Promise<{ accounts: AccountOption[]; categories: CategoryOption[] }> {
  const [accounts, categories] = await Promise.all([
    db.account.findMany({
      where: { householdId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, archivedAt: true },
    }),
    db.category.findMany({
      where: { householdId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, kind: true, archivedAt: true },
    }),
  ]);

  return {
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      archived: account.archivedAt !== null,
    })),
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      kind: category.kind,
      archived: category.archivedAt !== null,
    })),
  };
}
