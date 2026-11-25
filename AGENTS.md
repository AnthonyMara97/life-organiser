# AGENTS.md

Standing instructions for any AI assistant working in this repository. Read this
before making changes. It overrides general defaults.

## What this project is

**Life Organiser** — a private household management web app for exactly two
users (Anthony and his wife). It is a real tool the household uses daily. A
third allowlisted address — Anthony's software-development mentor — has access
to review the work (D29); the product itself is still designed for the household
of two.

It is **also** the place Anthony learns how software is architected: how the
pieces fit, where the boundaries are drawn, and why each layer exists. That is
the learning outcome this repository is responsible for. **Learning to write code
is not.** He has separate study time for fundamentals and has asked, explicitly,
that this repo not be used as a programming tutorial.

**Read `docs/07-handover.md` first.** It records the current state of the repo and
the machine, the decisions still waiting on Anthony, and the next action. It is
rewritten at the end of every session.

## What the owner is optimising for (revised 18 Nov 2026)

Two outcomes, in this order:

1. **A finished, usable v1** — deployed, and actually used by the household.
2. **An understanding of the architecture** — enough to explain how the app is
   put together, where the pieces live, and why, to another developer.

This replaces the earlier brief (17 Nov 2026), which also asked for teaching code
constructs and for Anthony to write code himself. That has been withdrawn: he
decided the fundamentals are better learned outside this project.

### What to teach: one architectural concept per session

Name **one** concept per session — the architectural idea the session's work
turns on — and explain it in two or three sentences, in the terms of the code in
front of him. Then move on.

Good examples: why the schema is the source of truth and a migration is versioned
SQL; where the server/client boundary is drawn and what may cross it; why every
query is household-scoped; why money is integer cents; what a driver adapter is
and why Prisma 7 needs one; why derived data is computed rather than stored.

Not in scope: syntax, language features, "what is a function", walkthroughs,
read-backs, "explain it back in your own words", or anything that would be at home
in a beginner course.

**If he asks for an explanation, give it.** He decides when he needs one; he does
not need to be pre-taught.

**If he says the session is short, cut the explanation, not the delivery.**

### How sessions run now

1. **Decisions first.** Open with the single decision blocking the next
   milestone: one sentence, two or three realistic options, your recommendation
   with what could go wrong, and the cost to reverse. Then wait.
2. **Build in one batch.** Once he has decided, implement without mid-build
   check-ins, unless something breaks or a genuinely new decision appears.
3. **Overview, then commit.** Show him what changed and why **before** committing
   — every time, in the chat, in plain English. He reviews every commit. Budget
   up to 20 minutes for this on top of the session's hour. He must understand
   what is going into the repository before it goes in.
4. **Commit, then push.** One logical change per commit.
5. **Close.** Rewrite `docs/07-handover.md` with the next blocking decision at the
   top and the session's architectural concept named, and update
   `docs/00-status.md` — position, what is settled, what is open.

## Decisions belong to the owner (added 15 Nov 2026)

Anthony makes every decision. Never implement a decision he has not approved —
including ones that seem obvious.

For anything that is not pure execution detail, present:

1. The decision, in one sentence — what actually needs choosing.
2. Two or three realistic options.
3. **Your recommendation — always, never omitted, never "it depends".** For the
   option you recommend, state what choosing it actually entails: what gets
   built, added, removed, or changes hands. Then a brief summary of why, in one
   or two sentences, including what could go wrong.
4. What it costs to reverse later.

Then stop and wait. A decision sent without a recommendation is not a decision
put to Anthony — it is homework.

### Check whether it is already decided (added 23 Nov 2026)

Before putting a decision, search for it. Every settled decision has an ID
(`D1`, `D2`, …). They are listed in `docs/00-status.md` under **SETTLED** and
argued in `docs/03-architecture.md` §12, with the environments in §11.

If a row already answers the question, it is settled: cite the ID and build on
it. Do not re-open it, do not present it as a new choice, and do not write a plan
that depends on reversing it.

If two records disagree — a document against a document, or a document against
what Anthony says the live system looks like — say so plainly and ask which is
true. Never pick one silently, and never assume the document is right about the
outside world: a Neon console, a Google client and Vercel are all state this
repository cannot see.

The same applies to position in the plan. If you cannot state the current
milestone and build item in one line from `docs/00-status.md`, read
`docs/04-roadmap.md` before saying anything.

**Pure execution detail** — a variable name, formatting, which file a helper
lives in — can proceed without asking, and should be noted in the summary.

**Always ask, without exception:** data model, dependencies, security, auth,
third-party services, scope, anything user-visible, and anything that changes the
roadmap.

Never write a recommendation into a document as though it were agreed. Mark
unapproved items `(proposed)` and leave them that way until Anthony confirms.

## Answer these before you code

0. Read `docs/00-status.md` — one page: the milestone, the build item, what is
   settled and what is still open. State POSITION from it before proposing
   anything. Not optional.
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
- Ask before adding a dependency. Each one must be justified in one sentence.
- No `any`. No `@ts-ignore`. If types are hard, say so and we fix the design.
- **Keep the tests.** They are not a teaching device; they are what allows fast
  changes to money and date logic without silent breakage.

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

Before committing, in the chat:

1. What changed, in plain English (one or two sentences per file or group).
2. **Why** it was done this way, and what the alternative was.
3. The architectural concept the change turns on — named once, two or three
   sentences, then assumed. Skip it for pure execution detail.
4. What to run to see it working.

Never leave unexplained magic in a diff. If a pattern is non-obvious, a short
comment aimed at a future reader of the file is enough.

## Definition of done

- [ ] Works on a 390px-wide phone and on desktop
- [ ] Input validated server-side
- [ ] Household-scoped query
- [ ] Loading, empty and error states handled
- [ ] Types pass (`pnpm typecheck`), lint passes, tests pass
- [ ] Relevant doc updated (feature status, decision log, or roadmap)
- [ ] Reviewed by Anthony before the commit
- [ ] Committed with a message explaining why

## Docs that must stay true

| File | Update when |
|---|---|
| `docs/00-status.md` | Every session, at the close — position, settled decisions, open questions |
| `docs/02-features.md` | A feature's status changes |
| `docs/03-architecture.md` | A technical decision is made or reversed |
| `docs/04-roadmap.md` | A milestone slips or scope changes |
| `docs/07-handover.md` | Every session, at the close |

`docs/05-working-agreement.md` records the standing rules of collaboration.
`docs/06-learning-log.md` is **frozen** as of 18 Nov 2026 — it is a record of work
already done, not a live document. Do not add to it.
