import { db } from "@/lib/db";
import { liveTransactionWhere } from "@/server/transactions";

/**
 * Categories for the management screen.
 *
 * The transaction count is the number of live rows filed against each category,
 * which is what makes "archive" safe to offer: history keeps the label, and the
 * count tells Anthony how much history that is. Counts come from one grouped
 * query rather than a count per category.
 */
export type CategoryListRow = {
  id: string;
  name: string;
  kind: "income" | "expense";
  parentId: string | null;
  parentName: string | null;
  archived: boolean;
  childCount: number;
  transactionCount: number;
};

export async function listCategories(
  householdId: string,
): Promise<CategoryListRow[]> {
  const [categories, counts] = await Promise.all([
    db.category.findMany({
      where: { householdId },
      select: {
        id: true,
        name: true,
        kind: true,
        parentId: true,
        archivedAt: true,
        parent: { select: { name: true } },
      },
    }),
    db.transaction.groupBy({
      by: ["categoryId"],
      where: liveTransactionWhere(householdId),
      _count: { _all: true },
    }),
  ]);

  const countByCategory = new Map(
    counts.map((row) => [row.categoryId, row._count._all]),
  );

  // Only live children count: they are what stops the parent being archived.
  const liveChildren = new Map<string, number>();
  for (const category of categories) {
    if (category.parentId && category.archivedAt === null) {
      liveChildren.set(
        category.parentId,
        (liveChildren.get(category.parentId) ?? 0) + 1,
      );
    }
  }

  return categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      kind: category.kind,
      parentId: category.parentId,
      parentName: category.parent?.name ?? null,
      archived: category.archivedAt !== null,
      childCount: liveChildren.get(category.id) ?? 0,
      transactionCount: countByCategory.get(category.id) ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
