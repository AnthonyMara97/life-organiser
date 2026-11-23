import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Life Organiser" };

// Placeholder dashboard. It names what is coming rather than faking numbers:
// Week 1 ends with an empty dashboard behind a real sign-in, and Week 2 brings
// the first household data.
const placeholders = [
  {
    title: "Accounts",
    body: "Everyday spending, savings and offset accounts, with balances.",
  },
  {
    title: "Transactions",
    body: "Listed by month, with a running total and a category per line.",
  },
  {
    title: "Budgets",
    body: "This month's budget lines and what is left to spend.",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-ink md:text-2xl">Dashboard</h1>
        <p className="text-sm text-ink-muted">
          Week 1: the shell. Household data arrives in Week 2.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-3">
        {placeholders.map((card) => (
          <li
            key={card.title}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <h2 className="text-sm font-medium text-ink">{card.title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {card.body}
            </p>
            <p className="mt-3 text-xs font-medium text-ink-subtle">Empty</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
