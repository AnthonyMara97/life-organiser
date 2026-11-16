# Life Organiser

A private, two-person household app: money, meals, groceries, chores, a shared
calendar and an exercise schedule in one place.

Built in public as a portfolio project and used daily by two people. The public
repository contains **no real household data** — only seed data for demos.

**Status:** Week 1 in progress. The scaffold builds, the date helpers are tested,
and the docs match the plan. Authentication and the database are next (as of
16 Nov 2026).

---

## What it will do

| Area | Phase | What it covers |
|---|---|---|
| Finances | 1 (first) | Accounts, transactions, categories, monthly budgets, bills, reports, CSV import |
| Calendar | 2 | Shared events, recurring appointments, who is where |
| Chores | 2 | Recurring tasks, rotation between two people, what is due |
| Meals | 3 | Recipes, weekly meal plan, "what are we having tonight" |
| Groceries | 3 | Shared list generated from the meal plan, grouped by aisle |
| Exercise | 4 | Weekly training schedule, sessions, adherence |
| AI capture | 4 | Photo or voice note in, structured entry out, confirm before saving |

## Stack at a glance

Next.js (App Router) · React · TypeScript · PostgreSQL · Prisma · Auth.js ·
Tailwind CSS · shadcn/ui · Vercel. Full reasoning in
[`docs/03-architecture.md`](docs/03-architecture.md).

## Documentation

Read in this order:

1. [`docs/01-product-brief.md`](docs/01-product-brief.md) — the problem, the users, goals and non-goals
2. [`docs/02-features.md`](docs/02-features.md) — every feature, prioritised
3. [`docs/03-architecture.md`](docs/03-architecture.md) — stack, data model, conventions
4. [`docs/04-roadmap.md`](docs/04-roadmap.md) — the 12-week build plan
5. [`docs/05-working-agreement.md`](docs/05-working-agreement.md) — how we build this together
6. [`docs/06-learning-log.md`](docs/06-learning-log.md) — concepts learned, for interview prep

`AGENTS.md` holds the standing instructions for AI assistants working in this
repository.

## Running it

Not yet applicable. This section will hold the real instructions once the app is
scaffolded:

```bash
pnpm install
cp .env.example .env.local   # then fill in local values
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Privacy

- The repository is public; the **data is not**. Real transactions, receipts and
  calendar entries live only in the production database.
- `.env.local` is ignored by git. No keys, tokens or passwords are ever committed.
- Screenshots and demos use a fictional seed household ("Demo Household").
- The app is invite-only: sign-in is restricted to two allowlisted email addresses.
