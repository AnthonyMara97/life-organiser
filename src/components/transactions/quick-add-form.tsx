"use client";

import { useActionState } from "react";

import {
  createExpense,
  type TransactionFormState,
} from "@/actions/transactions";

type Option = { id: string; name: string };

type QuickAddFormProps = {
  accounts: Option[];
  categories: Option[];
  today: string;
};

const initialState: TransactionFormState = { status: "idle" };

const fieldClass =
  "mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function QuickAddForm({
  accounts,
  categories,
  today,
}: QuickAddFormProps) {
  const [state, formAction, pending] = useActionState(
    createExpense,
    initialState,
  );

  const error = (field: string) => state.fieldErrors?.[field];

  // React 19 resets an uncontrolled form after a server action, even when the
  // action returns errors. Remounting with the submitted values (the key) keeps
  // the user's input instead of making them retype it.
  const formKey = state.values ? JSON.stringify(state.values) : "initial";

  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-ink">Add an expense</h2>
        <p className="text-xs text-ink-muted">
          Amount, category, account, date. It lands as confirmed.
        </p>
      </div>

      <form
        key={formKey}
        action={formAction}
        className="mt-3 grid gap-3 sm:grid-cols-2"
      >
        <label className="block text-xs font-medium text-ink-muted">
          Amount
          <input
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            required
            defaultValue={state.values?.amount ?? ""}
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
            defaultValue={state.values?.occurredOn ?? today}
            required
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
            defaultValue={state.values?.accountId ?? ""}
            aria-invalid={error("accountId") ? true : undefined}
            className={fieldClass}
          >
            <option value="" disabled>
              Choose an account
            </option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {error("accountId") ? (
            <span role="alert" className="mt-1 block text-xs text-danger">
              {error("accountId")}
            </span>
          ) : null}
        </label>

        <label className="block text-xs font-medium text-ink-muted">
          Category
          <select
            name="categoryId"
            required
            defaultValue={state.values?.categoryId ?? ""}
            aria-invalid={error("categoryId") ? true : undefined}
            className={fieldClass}
          >
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
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
            placeholder="What was it?"
            required
            defaultValue={state.values?.description ?? ""}
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

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
          >
            {pending ? "Saving…" : "Add expense"}
          </button>
        </div>
      </form>
    </section>
  );
}
