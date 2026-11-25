"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  categoryArchiveSchema,
  categoryInputSchema,
  categoryRenameSchema,
} from "@/lib/validation/categories";

export type CategoryFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: { name: string; kind: "income" | "expense"; parentId: string };
  savedAt?: number;
};

function fieldErrorsFrom(
  issues: readonly { path: PropertyKey[]; message: string }[],
) {
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
 * A parent must be in the same household, of the same kind, and itself
 * top-level. That last rule is the "one level of subcategories" constraint from
 * FIN-3, enforced in code because Postgres cannot express "parent has no parent"
 * as a constraint on itself without a trigger.
 */
async function resolveParent(
  householdId: string,
  parentId: string | undefined,
  kind: "income" | "expense",
): Promise<
  | { ok: true; parentId: string | null }
  | { ok: false; message: string }
> {
  if (!parentId) {
    return { ok: true, parentId: null };
  }

  const parent = await db.category.findFirst({
    where: { id: parentId, householdId },
    select: { id: true, kind: true, parentId: true },
  });

  if (!parent) {
    return { ok: false, message: "That parent category does not exist." };
  }
  if (parent.kind !== kind) {
    return {
      ok: false,
      message: "A subcategory must be the same kind as its parent.",
    };
  }
  if (parent.parentId !== null) {
    return {
      ok: false,
      message: "Categories have one level only. Choose a top-level parent.",
    };
  }

  return { ok: true, parentId: parent.id };
}

export async function createCategory(
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const session = await auth();
  const householdId = session?.user?.householdId;

  const values = {
    name: String(formData.get("name") ?? ""),
    kind: formData.get("kind") === "income" ? ("income" as const) : ("expense" as const),
    parentId: String(formData.get("parentId") ?? ""),
  };

  if (!householdId) {
    return {
      status: "error",
      message: "Your session expired. Sign in again.",
      values,
    };
  }

  const parsed = categoryInputSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
      values,
    };
  }

  const parent = await resolveParent(
    householdId,
    parsed.data.parentId,
    parsed.data.kind,
  );

  if (!parent.ok) {
    return {
      status: "error",
      fieldErrors: { parentId: parent.message },
      values,
    };
  }

  await db.category.create({
    data: {
      householdId,
      name: parsed.data.name,
      kind: parsed.data.kind,
      parentId: parent.parentId,
    },
  });

  revalidatePath("/categories");
  revalidatePath("/transactions");
  return {
    status: "success",
    savedAt: Date.now(),
    values: { name: "", kind: parsed.data.kind, parentId: "" },
  };
}

export async function renameCategory(
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const session = await auth();
  const householdId = session?.user?.householdId;

  const values = {
    name: String(formData.get("name") ?? ""),
    kind: "expense" as const,
    parentId: "",
  };

  if (!householdId) {
    return {
      status: "error",
      message: "Your session expired. Sign in again.",
      values,
    };
  }

  const parsed = categoryRenameSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    name: values.name,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the name.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
      values,
    };
  }

  const renamed = await db.category.updateMany({
    where: { id: parsed.data.id, householdId },
    data: { name: parsed.data.name },
  });

  if (renamed.count === 0) {
    return {
      status: "error",
      message: "That category no longer exists.",
      values,
    };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  return { status: "success", savedAt: Date.now(), values };
}

/**
 * Archive or restore, called from a plain form button.
 *
 * Archive rather than delete (FIN-3): a category with transactions must keep
 * its label so old rows stay readable. Restoring is the same statement with the
 * opposite value, which is also the undo for a mistaken archive.
 */
export async function setCategoryArchived(formData: FormData): Promise<void> {
  const session = await auth();
  const householdId = session?.user?.householdId;

  if (!householdId) {
    return;
  }

  const parsed = categoryArchiveSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    archived: String(formData.get("archived") ?? ""),
  });

  if (!parsed.success) {
    return;
  }

  // The page disables Archive for a parent with live children; repeat the check
  // here so a hand-made request cannot open that hole. One level of nesting
  // means the children have nowhere to go, so the parent waits.
  if (parsed.data.archived === "true") {
    const liveChildren = await db.category.count({
      where: {
        householdId,
        parentId: parsed.data.id,
        archivedAt: null,
      },
    });

    if (liveChildren > 0) {
      return;
    }
  }

  await db.category.updateMany({
    where: { id: parsed.data.id, householdId },
    data: { archivedAt: parsed.data.archived === "true" ? new Date() : null },
  });

  revalidatePath("/categories");
  revalidatePath("/transactions");
}
