# 04 — Roadmap

> Status: re-planned 18 Nov 2026
>
> **Confirmed: 6 focused hours per week** — one hour on each weeknight, thirty
> minutes on each weekend day. This is the real available time. Learning
> fundamentals now happens outside this project (see `AGENTS.md`), so those hours
> are not part of the budget.
>
> **Timeline (re-confirmed 18 Nov 2026): no hard deadline.** The plan was costed
> at 8–10 hours a week over 13 weeks. At 6 hours it is **stretched to 16 weeks**,
> which is the hard cap Anthony set on 15 Nov. After that, effort moves to a
> separate business solution as the main portfolio project.
>
> **After February: decide in January** whether this becomes maintenance-only or
> pauses. Not decided yet — do not assume.

## Re-plan — 18 November 2026

Two changes, both Anthony's decisions:

1. **Hours: 8–10 → 6 per week.** Weeks below keep their order and content but
   take proportionally longer; the week numbers describe sequence, not calendar
   dates. No week is compressed to catch up — a slipped week is a slipped date.
2. **Learning narrowed to architecture.** The project no longer teaches coding,
   and Anthony no longer writes code as a coaching exercise. Every **"Your turn"**
   task below is **withdrawn**; the assistant builds instead. The **"Learn"** line
   of each week becomes the week's **architectural concept** — one or two
   sentences, named once, tied to the code in front of him.

Scope rule at 6 hours: if a week overruns, cut its **P2** items first, then P1.
The P0 feature of each milestone is what the milestone is for. Record the cut in
`docs/02-features.md` §8, not by silently dropping it.

## Shape of the plan

Sixteen weeks, five milestones, one vertical slice per milestone:

```
W1        W2–3        W4–5        W6–7      W8        W9        W10       W11       W12–13
Foundations → Data+CRUD → Insight → Polish → Bills → Import → AI → Hardening → Portfolio
```

Every week has the same six parts:

| Part | Meaning |
|---|---|
| **Focus** | The one thing this week is about |
| **Build** | What exists at the end of the week |
| **Learn** | The week's architectural concept, named once |
| **Done when** | The acceptance test, in one sentence |
| **Watch out** | The thing most likely to eat the week |

---

## Week 1 — Foundations

**Focus:** get a deployed, authenticated, empty app in front of you.

**Already done** (sessions 1–5): repo, pnpm, Next.js + TypeScript + Tailwind
scaffold, `.env.example`, app builds and tests. Prisma 7 is installed and the
`Household` + `User` schema is committed — validated, but with no database behind
it yet.

**Build — in hourly sessions**

1. **Database.** Choose Neon or Docker (`docs/07-handover.md` §0), create it, put
   `DATABASE_URL` in `.env.local`, install `@prisma/client`, run the first
   migration. Two tables exist.
2. **Auth.** Auth.js with Google; `ALLOWED_EMAILS` allowlist enforced in the
   `signIn` callback; sign-in works for two emails and rejects a third.

   *Anthony's own task, before this session: create the Google Cloud OAuth client
   — project, consent screen, redirect URIs. Screenshot each step.*
3. **Shell.** Sidebar on desktop, bottom tabs on phone, placeholder dashboard;
   sign-in page that works at 390px.
4. **Deploy.** Vercel project connected to the GitHub repo, environment variables
   set, production database in Neon.

**Concept of the week:** the schema is the source of truth and the migration it
generates is versioned SQL you commit — plus, for auth, that the *server* decides
who is allowed in and the client only asks.

**Done when:** you sign in from your phone on the deployed URL, using only the
allowlisted emails, and see an empty dashboard.

**Watch out:** Google OAuth setup (consent screen, redirect URIs) is the most
likely thing to eat the hour. Take screenshots as you go so it is repeatable.

---

## Week 2 — Schema, seed, read

**Focus:** a real data model, and data on screen.

**Build**
- Full Phase 1 schema: `Account`, `Category`, `Transaction`, `BudgetMonth`,
  `BudgetLine`, `Bill`, `ImportBatch`, `AiUsage`.
- `pnpm db:seed` creating a fictional household with 3 months of transactions,
  categories and one budget month.
- Transactions list: server-rendered, paginated, month filter, total.

**Learn:** relational modelling and foreign keys · Prisma schema syntax ·
migrations vs `db push` · server components vs client components · why the
database computes aggregates rather than JavaScript.

**Your turn:** extend the seed script with 10 more transactions of your own
invention, including one refund (positive amount).

**Done when:** the transactions page lists seeded data for the current month and
the total matches a manual sum.

**Watch out:** timezone bugs on transaction dates. Dates are calendar days, not
timestamps — do not let `new Date()` sneak in.

---

## Week 3 — Write, edit, delete

**Focus:** the full CRUD loop, done properly.

**Build**
- Quick-add transaction form (amount, category, account, date, description).
- Zod schema shared by form and server action.
- Edit and delete, with an undo toast.
- Categories management, with archive instead of delete.
- Filters: account, category, status, free-text search.

**Learn:** server actions · form validation on both sides · optimistic UI ·
accessibility basics (labels, focus, keyboard) · soft delete and why.

**Your turn:** the delete-with-undo interaction. I will give you the shape and
review, but you write it.

**Done when:** you can add a cash expense on your phone in under five seconds and
undo a mistaken delete.

**Watch out:** do not build a custom modal system. Use shadcn's dialog and move
on.

---

## Week 4 — Accounts and the dashboard

**Focus:** turning rows into answers.

**Build**
- Account list with computed balances.
- Dashboard: month in/out/net, recent activity, uncategorised count.
- Month selector that works across the app.
- Transfers between own accounts (two linked rows).

**Learn:** SQL aggregates with Prisma · date range boundaries in
`Australia/Melbourne` · the cost of computing in the request path and when it
matters · `Intl.NumberFormat` for currency.

**Your turn:** the month-boundary helper in `src/lib/dates.ts`, with unit tests.
This is the highest-value thing you can own: every total depends on it.

**Done when:** the dashboard numbers reconcile with the transactions list for the
same month, including one transfer that is excluded from both income and expense.

**Watch out:** "this month" in UTC versus Melbourne. A transaction on the 1st can
land in the wrong month.

---

## Week 5 — Budgets

**Focus:** the feature that makes the app worth opening daily.

**Build**
- Budget month creation, copying last month's lines.
- Budget line editing per category.
- Progress bars: allocated, spent, remaining, over-budget state.
- Unbudgeted spend surfaced explicitly.
- Category breakdown chart.

**Learn:** derived vs stored data · aggregate queries with `groupBy` · accessible
data visualisation (not colour alone) · why a bar chart beats a pie chart.

**Your turn:** the budget bar component, including its empty and over-budget
states.

**Done when:** adding a transaction immediately changes the right budget bar, and
overspending is obvious without reading a number.

**Watch out:** scope creep into rollover and envelopes. Parked. Ship the simple
version.

---

## Week 6 — Mobile, PWA, polish *(Christmas week — deliberately light)*

**Focus:** make it feel like an app, not a website.

**Build**
- PWA manifest, icons, install prompt, offline shell.
- Mobile pass over every screen at 390px.
- Empty states, loading skeletons, error boundaries.
- Dark mode checked on both devices.

**Learn:** responsive design with Tailwind · what a service worker does ·
perceived performance · progressive enhancement.

**Your turn:** audit all screens on your phone and file the ten worst issues as
tickets. Fix three of them.

**Done when:** the app is installed on both phones and neither of you needs the
browser to use it.

**Watch out:** PWA caching bugs during development. Keep caching conservative.

---

## Week 7 — Reports *(New Year week — light)*

**Focus:** hindsight, made useful.

**Build**
- Spend by category for a chosen month.
- Six-month trend.
- Top merchants.
- Month-over-month comparison.

**Learn:** charting with a React library · query shapes and indexes · reading an
`EXPLAIN` plan at a basic level.

**Your turn:** write the SQL (via Prisma) for "top 5 merchants by spend" yourself.

**Done when:** the reports answer "where did the money go last month" in one
screen.

**Watch out:** time lost to chart theming. Function first.

---

## Week 8 — Bills and recurring

**Focus:** nothing gets paid late.

**Build**
- Bill CRUD with frequency and next due date.
- "Mark as paid" creating the matching transaction.
- Upcoming (30 days) and overdue lists on the dashboard.
- Next-due-date calculation that survives month-end edge cases (31st, Feb).

**Learn:** recurrence maths (the hard part) · idempotency when a button is
double-clicked · scheduled jobs (Vercel cron) and why they are not required yet.

**Your turn:** the `nextDueDate` function plus tests for the 31st, February and
leap years.

**Done when:** a monthly bill due on the 31st shows the correct date in February.

**Watch out:** this looks trivial and is not. Write the tests first.

---

## Week 9 — CSV import

**Focus:** the first real integration — untrusted data from outside the app.

**Build**
- Upload form: `<input type="file">` accepting `.csv`, with size and type checks.
- Hand-written CSV parser and fixtures: quoted fields, embedded commas and
  newlines, CRLF, blank rows, a UTF-8 BOM.
- Column mapping → preview the first 20 rows → commit.
- Fingerprint-based duplicate detection.
- Import history with counts, and a review queue for `needs_review` rows.

**Learn:** receiving a file upload server-side · parsing untrusted input
defensively · idempotency · why the file is parsed in memory and discarded ·
reporting a bad row by number instead of failing the whole import.

**Your turn:** the fingerprint function and its tests.

**Done when:** importing the same CSV twice produces zero duplicates, and every
imported row is in the review queue.

**Watch out:** CSV is deceptively loose. Encoding, quoting and line endings will
each break a naive `split(',')`. Build the fixture set before the UI, and never
treat the first clean file as proof the parser works.

---

## Week 10 — AI capture

**Focus:** the capture loop that removes the last bit of friction.

**Build**
- Text capture → draft transaction.
- Receipt photo capture.
- Voice note capture (transcribe, then parse).
- Review queue: confirm, correct, discard.
- `AiUsage` logging and a hard monthly cap.

**Learn:** calling an LLM API · structured output with a JSON schema · prompt
design for extraction · cost accounting · graceful degradation when a provider
fails.

**Your turn:** the review-queue screen. Accuracy of extraction is my problem;
the interface is yours.

**Done when:** a photo of a receipt becomes a confirmed transaction in under 20
seconds, and the usage table shows what it cost.

**Watch out:** don't chase 100% extraction accuracy. A pre-filled draft the
human confirms is the correct product decision.

---

## Week 11 — Hardening

**Focus:** the unglamorous work that makes it trustworthy.

**Build**
- Unit tests for money, dates, fingerprints, budget maths.
- One Playwright flow: sign in → add → see on dashboard.
- Seed data that looks like a real household.
- Read-only demo account.
- Error, empty and forbidden states everywhere.
- Backup/export working (FIN-10).

**Learn:** testing philosophy — test behaviour, not implementation · fixtures and
factories · why demo data is a product feature.

**Your turn:** write the Playwright test yourself, start to finish.

**Done when:** a stranger could sign into the demo, understand the app in a
minute, and could not write to it.

**Watch out:** perfectionism. This week is about coverage of risk, not of lines.

---

## Week 12 — Portfolio finish

**Focus:** turning a working app into evidence.

**Build**
- README: what, why, screenshots (demo data), stack, architecture diagram, how to
  run, what I would do next.
- Three short write-ups: integer cents, idempotent imports, parsing a CSV without
  a library.
- Repo tidy: no dead code, no commented-out experiments, consistent commits.
- Deployed and monitored; both of you using it daily.

**Learn:** technical writing · explaining trade-offs · git history as a
portfolio · basic monitoring (Vercel logs, error alerts).

**Your turn:** write the README yourself. I will review it, not rewrite it.

**Done when:** you would be comfortable sending the link to a hiring manager and
walking them through any file in the repo.

---

## Week 13 — Buffer

Reserved. It will be needed: something always slips, and Christmas is in this
plan. If nothing slips, use it for the first Phase 2 feature.

---

## What comes after (Phase 2 preview)

| Window | Domain | Why this order |
|---|---|---|
| Feb–Mar 2027 | Calendar + chores | Already familiar CRUD; adds recurrence and a shared view |
| Mar–Apr 2027 | Meals + groceries | The highest-value loop in the app, and realtime is a new skill |
| Apr–May 2027 | Exercise | Simplest domain, good for a confidence win |

## Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Hours fall short of 6/week | High | 16-week stretch; each week's "Build" list is ordered so the top two items alone constitute a usable increment. Cut P2, never the P0 |
| Christmas and New Year disruption | Certain | Weeks 6 and 7 are deliberately light |
| CSV edge cases (encoding, quoting) burn a week | Medium | Build fixtures from a redacted real export and test the parser before the UI; milestone 9 is late enough to absorb a slip |
| Scope creep (every new idea feels essential) | High | New ideas go to `02-features.md` §8, not the sprint |
| Motivation dip mid-project | Medium | Weeks 4, 5 and 8 each deliver something visible and personally useful |
| Real data breaks privacy discipline | Low, high impact | Seed data by default; `AGENTS.md` hard rule; screenshots from demo only |

## Weekly rhythm

Five weeknight sessions of one hour, two weekend sessions of thirty minutes.

1. **Decide (first 10 minutes):** the assistant puts the one blocking decision,
   with options and a recommendation. Anthony answers.
2. **Build (the rest):** one batch, no mid-build check-ins.
3. **Review before commit (up to 20 minutes, outside the hour):** the assistant
   shows what changed and why; Anthony reviews; then it is committed and pushed.
4. **Close:** rewrite `docs/07-handover.md`, naming the next blocking decision and
   the session's architectural concept.
