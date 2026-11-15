# AGENTS.md

Standing instructions for any AI assistant working in this repository. Read this
before making changes. It overrides general defaults.

## What this project is

**Life Organiser** — a private household management web app for exactly two
users (Anthony and his wife). It is simultaneously a real daily-use tool and a
learning vehicle for a career change into full stack development.

The owner is **learning**. Code quality matters, but comprehensibility matters
more. Do not reach for clever abstractions.

**Read `docs/07-handover.md` first.** It records the current state of the repo and
the machine, the decisions still waiting on Anthony, and the next action. It is
rewritten at the end of every session.

## Decisions belong to the owner (added 15 Nov 2026)

Anthony makes every decision. Never implement a decision he has not approved —
including ones that seem obvious.

For anything that is not pure execution detail, present:

1. The decision, in one sentence.
2. Two or three realistic options.
3. Your recommendation and **why**, including what could go wrong.
4. What it costs to reverse later.

Then stop and wait.

**Pure execution detail** — a variable name, formatting, which file a helper
lives in — can proceed without asking, and should be noted in the summary.

**Always ask, without exception:** data model, dependencies, security, auth,
third-party services, scope, anything user-visible, and anything that changes the
roadmap.

Never write a recommendation into a document as though it were agreed. Mark
unapproved items `(proposed)` and leave them that way until Anthony confirms.

## Answer these before you code

1. Read `docs/01-product-brief.md` and `docs/02-features.md` — does the request
   fit an existing feature ID, or is it new scope?
2. Read `docs/03-architecture.md` — does the request match a recorded decision?
   If it contradicts one, say so before implementing it.
3. Check `docs/04-roadmap.md` — is this the current milestone? If not, ask.

Scope beyond the current milestone goes into `docs/02-features.md` as a backlog
entry, not into the current change.

## Stack (decided — do not substitute without agreement)

- Next.js (App Router) + React + TypeScript, strict mode
- PostgreSQL + Prisma
- Auth.js (Google provider, email allowlist)
- Tailwind CSS + shadcn/ui
- Zod for validation at every boundary
- pnpm · Vitest · Playwright · Vercel

## Hard rules

- **Never commit secrets or real household data.** `.env*` files (except
  `.env.example`) are ignored. Seed data is fictional.
- **Never commit screenshots or fixtures containing real balances, addresses or
  names.** Use the demo household.
- **All money is integer cents**, stored as `Int`. Never `Float`, never `Decimal`
  for arithmetic in application code. Format only at render time.
- **Every database query is scoped to a household.** No exceptions, including
  "just a lookup". Missing a scope is a data-leak bug.
- **Validate input with Zod** on every server boundary (server action or route
  handler). Never trust the client.
- Dates that represent a calendar day (transaction date, due date) are stored as
  a date, not a timestamp. Moments in time are stored as timestamptz in UTC and
  rendered in `Australia/Melbourne`.
- Ask before adding a dependency. The owner is learning; each one must be
  justified in one sentence.
- No `any`. No `@ts-ignore`. If types are hard, say so and we fix the design.

## Conventions

- British/Australian spelling in prose and UI copy ("organise", "colour").
- US spelling in code identifiers (`color`, `organize`) to match library APIs.
- Server code lives in `src/server/`, pure helpers in `src/lib/`.
- Files: `kebab-case.ts`. Components: `PascalCase` exports in kebab-case files.
- Commits: Conventional Commits, scoped by area, e.g.
  `feat(transactions): add quick-add form with optimistic update`.
  The body explains **why**, not what.
- One logical change per commit. If a diff touches more than ~5 files, question
  whether it should be split.

## How to communicate changes

After implementing anything, explain:

1. What changed, in plain English (one or two sentences).
2. **Why** it was done this way, and what the alternative was.
3. Any concept the owner has not seen before — name it, explain it in two
   sentences, link the docs page.
4. What to run to see it working.

Never leave unexplained magic in a diff. If a pattern is non-obvious, write a
short comment aimed at a learner.

## Definition of done

- [ ] Works on a 390px-wide phone and on desktop
- [ ] Input validated server-side
- [ ] Household-scoped query
- [ ] Loading, empty and error states handled
- [ ] Types pass (`pnpm typecheck`), lint passes, tests pass
- [ ] Relevant doc updated (feature status, decision log, or learning log)
- [ ] Committed with a message explaining why

## Docs that must stay true

| File | Update when |
|---|---|
| `docs/02-features.md` | A feature's status changes |
| `docs/03-architecture.md` | A technical decision is made or reversed |
| `docs/04-roadmap.md` | A milestone slips or scope changes |
| `docs/06-learning-log.md` | A new concept is learned |
