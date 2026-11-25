import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { setCategoryArchived } from "@/actions/categories";
import { CategoryForm } from "@/components/categories/category-form";
import { RenameCategoryDialog } from "@/components/categories/rename-category-dialog";
import { auth } from "@/lib/auth";
import { listCategories, type CategoryListRow } from "@/server/categories";

export const metadata: Metadata = { title: "Categories — Life Organiser" };

const actionButton =
  "rounded-md border border-line px-2.5 py-1 text-xs font-medium text-ink-muted hover:bg-accent-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function countLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function CategoryActions({ category }: { category: CategoryListRow }) {
  // A parent with live children is not archived from under them: the children
  // would stay in the quick-add list with no visible parent. Archive or move
  // them first. The action repeats this check — the disabled button is a hint,
  // not the enforcement.
  const blocked =
    !category.archived && category.childCount > 0;

  return (
    <div className="flex items-center gap-1">
      <RenameCategoryDialog id={category.id} name={category.name} />
      <form action={setCategoryArchived}>
        <input type="hidden" name="id" value={category.id} />
        <input
          type="hidden"
          name="archived"
          value={category.archived ? "false" : "true"}
        />
        <button
          type="submit"
          disabled={blocked}
          title={
            blocked
              ? "Archive or move its subcategories first"
              : category.archived
                ? "Bring this category back"
                : "Hide this category but keep its history"
          }
          className={`${actionButton} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {category.archived ? "Restore" : "Archive"}
        </button>
      </form>
    </div>
  );
}

function CategoryRow({
  category,
  child = false,
}: {
  category: CategoryListRow;
  child?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 py-2.5 ${
        child ? "pl-6" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-2 text-sm text-ink">
          <span className={child ? "text-ink-muted" : "font-medium"}>
            {child ? "↳ " : ""}
            {category.name}
          </span>
          {category.archived ? (
            <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-muted">
              Archived
            </span>
          ) : null}
        </p>
        <p className="mt-0.5 text-xs text-ink-muted">
          {countLabel(category.transactionCount, "transaction")}
          {category.childCount > 0
            ? ` · ${countLabel(category.childCount, "subcategory", "subcategories")}`
            : ""}
          {category.parentName ? ` · under ${category.parentName}` : ""}
        </p>
      </div>
      <CategoryActions category={category} />
    </div>
  );
}

function CategorySection({
  title,
  rows,
}: {
  title: string;
  rows: CategoryListRow[];
}) {
  const active = rows.filter((row) => !row.archived);
  const archived = rows.filter((row) => row.archived);
  const activeIds = new Set(active.map((row) => row.id));
  // A child whose parent is archived (restored on its own, say) is shown at the
  // top of the list rather than nowhere: no live category may be invisible.
  const tops = active.filter(
    (row) => row.parentId === null || !activeIds.has(row.parentId),
  );
  const childrenOf = (id: string) =>
    active.filter((row) => row.parentId === id);

  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <h2 className="text-sm font-medium text-ink">{title}</h2>

      {tops.length === 0 ? (
        <p className="mt-2 text-xs text-ink-muted">No active categories.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {tops.map((top) => {
            const children = childrenOf(top.id);
            return (
              <li key={top.id}>
                <CategoryRow category={top} />
                {children.length > 0 ? (
                  <div className="border-t border-line/60">
                    {children.map((child) => (
                      <CategoryRow key={child.id} category={child} child />
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {archived.length > 0 ? (
        <details className="mt-3 border-t border-line pt-3">
          <summary className="cursor-pointer text-xs font-medium text-ink-muted">
            Archived ({archived.length})
          </summary>
          <ul className="mt-2 divide-y divide-line">
            {archived.map((row) => (
              <li key={row.id}>
                <CategoryRow category={row} />
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

export default async function CategoriesPage() {
  const session = await auth();
  const householdId = session?.user?.householdId;

  if (!householdId) {
    redirect("/login");
  }

  const categories = await listCategories(householdId);

  // Only top-level, live categories can become a parent (one level, FIN-3).
  const parents = categories
    .filter((category) => !category.archived && category.parentId === null)
    .map((category) => ({
      id: category.id,
      name: category.name,
      kind: category.kind,
    }));

  const expenses = categories.filter((category) => category.kind === "expense");
  const income = categories.filter((category) => category.kind === "income");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-ink md:text-2xl">
            Categories
          </h1>
          <p className="text-sm text-ink-muted">
            {categories.filter((category) => !category.archived).length} active ·{" "}
            {categories.filter((category) => category.archived).length} archived
          </p>
        </div>
        <Link
          href="/transactions"
          className="text-xs text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          ← Transactions
        </Link>
      </div>

      <p className="rounded-lg border border-dashed border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
        Archiving hides a category from the quick-add form and the dropdowns but
        keeps every transaction filed under it, with its name. Nothing here is
        ever hard-deleted.
      </p>

      <CategoryForm parents={parents} />

      <CategorySection title="Expenses" rows={expenses} />
      <CategorySection title="Income" rows={income} />
    </div>
  );
}
