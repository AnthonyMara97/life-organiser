"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createCategory } from "@/actions/categories";
import type { CategoryFormState } from "@/actions/categories";

const initialState: CategoryFormState = { status: "idle" };

const fieldClass =
  "mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

type ParentOption = { id: string; name: string; kind: "income" | "expense" };

export function CategoryForm({ parents }: { parents: ParentOption[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createCategory,
    initialState,
  );
  const [kind, setKind] = useState<"expense" | "income">("expense");

  // The server revalidates the page; the refresh here makes the new row appear
  // in the same interaction rather than on the next navigation.
  const savedAt = state.status === "success" ? state.savedAt : undefined;
  useEffect(() => {
    if (savedAt) router.refresh();
  }, [savedAt, router]);

  // On success the action returns blank values, so the key changes and the
  // uncontrolled inputs clear; on an error it keeps what was typed.
  const formKey =
    state.status === "success"
      ? `saved-${state.savedAt}`
      : state.values
        ? JSON.stringify(state.values)
        : "initial";

  const error = (field: string) => state.fieldErrors?.[field];
  const parentOptions = parents.filter((parent) => parent.kind === kind);

  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-ink">Add a category</h2>
        <p className="text-xs text-ink-muted">
          One level of subcategories. Archived, never deleted.
        </p>
      </div>

      <form
        key={formKey}
        action={formAction}
        className="mt-3 grid gap-3 sm:grid-cols-3"
      >
        <label className="block text-xs font-medium text-ink-muted">
          Name
          <input
            name="name"
            maxLength={60}
            required
            placeholder="Groceries"
            defaultValue={state.values?.name ?? ""}
            aria-invalid={error("name") ? true : undefined}
            className={fieldClass}
          />
          {error("name") ? (
            <span role="alert" className="mt-1 block text-xs text-danger">
              {error("name")}
            </span>
          ) : null}
        </label>

        <label className="block text-xs font-medium text-ink-muted">
          Kind
          <select
            name="kind"
            value={kind}
            onChange={(event) =>
              setKind(event.target.value === "income" ? "income" : "expense")
            }
            className={fieldClass}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          {error("kind") ? (
            <span role="alert" className="mt-1 block text-xs text-danger">
              {error("kind")}
            </span>
          ) : null}
        </label>

        <label className="block text-xs font-medium text-ink-muted">
          Parent (optional)
          <select
            key={kind}
            name="parentId"
            defaultValue=""
            className={fieldClass}
          >
            <option value="">Top level</option>
            {parentOptions.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </select>
          {error("parentId") ? (
            <span role="alert" className="mt-1 block text-xs text-danger">
              {error("parentId")}
            </span>
          ) : null}
        </label>

        {state.message ? (
          <p role="alert" className="text-sm text-danger sm:col-span-3">
            {state.message}
          </p>
        ) : null}

        {state.status === "success" ? (
          <p role="status" className="text-sm text-ink-muted sm:col-span-3">
            Category added.
          </p>
        ) : null}

        <div className="sm:col-span-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add category"}
          </button>
        </div>
      </form>
    </section>
  );
}
