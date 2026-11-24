import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  addMonthsClamped,
  formatDayLabel,
  formatMonthLabel,
  isMonth,
  todayInTimeZone,
} from "@/lib/dates";
import { formatCents } from "@/lib/money";
import { listTransactionsForMonth } from "@/server/transactions";

export const metadata: Metadata = { title: "Transactions — Life Organiser" };

const PAGE_SIZE = 20;

type SearchParams = { month?: string; page?: string };

function currentMonth(): string {
  return todayInTimeZone().slice(0, 7);
}

function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function pageHref(month: string, page: number): string {
  return `/transactions?month=${month}&page=${page}`;
}

const paginationLink =
  "rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-accent-soft hover:text-ink";
const paginationDisabled =
  "rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink-subtle opacity-50";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const householdId = session?.user?.householdId;

  if (!householdId) {
    redirect("/login");
  }

  const params = await searchParams;
  const month =
    params.month && isMonth(params.month) ? params.month : currentMonth();
  const result = await listTransactionsForMonth(
    householdId,
    month,
    parsePage(params.page),
    PAGE_SIZE,
  );

  const monthLabel = formatMonthLabel(month);
  const thisMonth = currentMonth();
  const previousMonth = addMonthsClamped(`${month}-01`, -1).slice(0, 7);
  const nextMonth = addMonthsClamped(`${month}-01`, 1).slice(0, 7);
  const firstOnPage =
    result.totalCount === 0 ? 0 : (result.page - 1) * PAGE_SIZE + 1;
  const lastOnPage = Math.min(result.page * PAGE_SIZE, result.totalCount);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-ink md:text-2xl">
            Transactions
          </h1>
          <p className="text-sm text-ink-muted">
            {monthLabel} · {result.totalCount}{" "}
            {result.totalCount === 1 ? "transaction" : "transactions"} · net{" "}
            <span
              className={
                result.totalCents < 0
                  ? "font-medium text-danger"
                  : "font-medium text-ink"
              }
            >
              {formatCents(result.totalCents)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1 text-sm">
          <Link
            href={pageHref(previousMonth, 1)}
            aria-label="Previous month"
            className={paginationLink}
          >
            ←
          </Link>
          <span className="min-w-36 text-center text-sm font-medium text-ink">
            {monthLabel}
          </span>
          <Link
            href={pageHref(nextMonth, 1)}
            aria-label="Next month"
            className={paginationLink}
          >
            →
          </Link>
          {month !== thisMonth ? (
            <Link
              href="/transactions"
              className="ml-2 text-xs text-ink-muted underline-offset-4 hover:text-ink hover:underline"
            >
              This month
            </Link>
          ) : null}
        </div>
      </div>

      {result.totalCount === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">
            No transactions in {monthLabel}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-ink-muted">
            Manual entry arrives in Week 3 and CSV import in Week 9. This page
            already reads the real query, so the first row will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="min-w-full text-sm">
              <caption className="sr-only">
                Transactions for {monthLabel}
              </caption>
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
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0"
                  >
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ink-muted">
              Showing {firstOnPage}–{lastOnPage} of {result.totalCount}
            </p>

            {result.pageCount > 1 ? (
              <nav
                aria-label="Pagination"
                className="flex items-center gap-2"
              >
                {result.page > 1 ? (
                  <Link
                    href={pageHref(month, result.page - 1)}
                    className={paginationLink}
                  >
                    Previous
                  </Link>
                ) : (
                  <span className={paginationDisabled}>Previous</span>
                )}
                <span className="text-xs text-ink-muted">
                  Page {result.page} of {result.pageCount}
                </span>
                {result.page < result.pageCount ? (
                  <Link
                    href={pageHref(month, result.page + 1)}
                    className={paginationLink}
                  >
                    Next
                  </Link>
                ) : (
                  <span className={paginationDisabled}>Next</span>
                )}
              </nav>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
