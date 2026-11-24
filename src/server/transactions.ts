import { isoDay, monthBounds } from "@/lib/dates";
import { db } from "@/lib/db";

/**
 * The transactions list for one month.
 *
 * The household id is passed in by the caller, which reads it from the session
 * — never from the URL or a form field. Every query below filters on it, so a
 * malformed request can only show the caller's own household.
 */
export type TransactionListRow = {
  id: string;
  occurredOn: string;
  description: string;
  merchant: string | null;
  amountCents: number;
  status: "needs_review" | "confirmed";
  accountName: string;
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
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<TransactionListResult> {
  const { start, end } = monthBounds(month);

  // `occurredOn` is a @db.Date. Prisma compares it as a Date at UTC midnight,
  // which is exactly the calendar day we mean; no time zone is involved.
  const occurredOn = {
    gte: new Date(`${start}T00:00:00.000Z`),
    lte: new Date(`${end}T00:00:00.000Z`),
  };
  const where = { householdId, occurredOn };

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
      accountName: row.account.name,
      categoryName: row.category.name,
    })),
    totalCount,
    totalCents: aggregate._sum.amountCents ?? 0,
    page,
    pageCount,
  };
}
