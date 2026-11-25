import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { QuickAddForm } from "@/components/transactions/quick-add-form";
import { TransactionTable } from "@/components/transactions/transaction-table";
import {
  addMonthsClamped,
  formatMonthLabel,
  isMonth,
  todayInTimeZone,
} from "@/lib/dates";
import { formatCents } from "@/lib/money";
import {
  getTransactionOptions,
  listTransactionsForMonth,
  type TransactionFilters,
} from "@/server/transactions";

export const metadata: Metadata = { title: "Transactions — Life Organiser" };

const PAGE_SIZE = 20;

type SearchParams = {
  month?: string;
  page?: string;
  account?: string;
  category?: string;
  status?: string;
  q?: string;
};

function currentMonth(): string {
  return todayInTimeZone().slice(0, 7);
}

function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseStatus(value: string | undefined): TransactionFilters["status"] {
  return value === "needs_review" || value === "confirmed" ? value : undefined;
}

/** Keeps the current filters on every month and page link. */
function listHref(
  month: string,
  page: number,
  filters: TransactionFilters,
): string {
  const params = new URLSearchParams({ month });
  if (page > 1) params.set("page", String(page));
  if (filters.accountId) params.set("account", filters.accountId);
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.status) params.set("status", filters.status);
  if (filters.query) params.set("q", filters.query);
  return `/transactions?${params.toString()}`;
}

const paginationLink =
  "rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-accent-soft hover:text-ink";
const paginationDisabled =
  "rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink-subtle opacity-50";
const fieldClass =
  "mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

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

  const filters: TransactionFilters = {
    accountId: params.account || undefined,
    categoryId: params.category || undefined,
    status: parseStatus(params.status),
    query: params.q?.trim().slice(0, 100) || undefined,
  };
  const hasFilters = Boolean(
    filters.accountId || filters.categoryId || filters.status || filters.query,
  );

  const [result, options] = await Promise.all([
    listTransactionsForMonth(
      householdId,
      month,
      parsePage(params.page),
      filters,
      PAGE_SIZE,
    ),
    getTransactionOptions(householdId),
  ]);

  // The quick-add form is deliberately narrower than the filters: a new row
  // should not be filed against an archived account, and it is expense-only.
  const activeAccounts = options.accounts.filter((account) => !account.archived);
  const activeExpenseCategories = options.categories.filter(
    (category) => !category.archived && category.kind === "expense",
  );

  const monthLabel = formatMonthLabel(month);
  const today = todayInTimeZone();
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
            href={listHref(previousMonth, 1, filters)}
            aria-label="Previous month"
            className={paginationLink}
          >
            ←
          </Link>
          <span className="min-w-36 text-center text-sm font-medium text-ink">
            {monthLabel}
          </span>
          <Link
            href={listHref(nextMonth, 1, filters)}
            aria-label="Next month"
            className={paginationLink}
          >
            →
          </Link>
          {month !== thisMonth ? (
            <Link
              href={listHref(thisMonth, 1, filters)}
              className="ml-2 text-xs text-ink-muted underline-offset-4 hover:text-ink hover:underline"
            >
              This month
            </Link>
          ) : null}
        </div>
      </div>

      {activeAccounts.length > 0 && activeExpenseCategories.length > 0 ? (
        <QuickAddForm
          accounts={activeAccounts}
          categories={activeExpenseCategories}
          today={today}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-line bg-surface px-4 py-4 text-sm text-ink-muted">
          Add an account and an expense category before recording a
          transaction.
        </p>
      )}

      <section className="rounded-lg border border-line bg-surface p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-ink">Filter</h2>
          <Link
            href="/categories"
            className="text-xs text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Manage categories →
          </Link>
        </div>

        <form
          method="get"
          action="/transactions"
          className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <input type="hidden" name="month" value={month} />

          <label className="block text-xs font-medium text-ink-muted">
            Account
            <select
              name="account"
              defaultValue={filters.accountId ?? ""}
              className={fieldClass}
            >
              <option value="">All accounts</option>
              {options.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                  {account.archived ? " (archived)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium text-ink-muted">
            Category
            <select
              name="category"
              defaultValue={filters.categoryId ?? ""}
              className={fieldClass}
            >
              <option value="">All categories</option>
              {options.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.archived ? " (archived)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium text-ink-muted">
            Status
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className={fieldClass}
            >
              <option value="">All statuses</option>
              <option value="needs_review">Needs review</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </label>

          <label className="block text-xs font-medium text-ink-muted">
            Search
            <input
              type="search"
              name="q"
              maxLength={100}
              placeholder="Description or merchant"
              defaultValue={filters.query ?? ""}
              className={fieldClass}
            />
          </label>

          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Apply filters
            </button>
            {hasFilters ? (
              <Link
                href={`/transactions?month=${month}`}
                className="text-xs text-ink-muted underline-offset-4 hover:text-ink hover:underline"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      {result.totalCount === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">
            {hasFilters
              ? "No transactions match these filters"
              : `No transactions in ${monthLabel}`}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-ink-muted">
            {hasFilters
              ? "Try a wider date range, or clear the filters to see the whole month."
              : "Add an expense above. CSV import arrives in Week 9."}
          </p>
        </div>
      ) : (
        <>
          <TransactionTable
            rows={result.rows}
            accounts={options.accounts}
            categories={options.categories}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ink-muted">
              Showing {firstOnPage}–{lastOnPage} of {result.totalCount}
            </p>

            {result.pageCount > 1 ? (
              <nav aria-label="Pagination" className="flex items-center gap-2">
                {result.page > 1 ? (
                  <Link
                    href={listHref(month, result.page - 1, filters)}
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
                    href={listHref(month, result.page + 1, filters)}
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
