# 02 — Feature Specification

> Status: draft for review · Last updated: 16 Nov 2026
>
> **Phase 1 is finances.** Everything else is specified now, but deliberately
> built later. New ideas go in §9, never straight into a milestone.

## How to read this

Every feature has an ID (`FIN-2`) used in commits, issues and this roadmap.
Status values: `TODO` · `BUILDING` · `DONE` · `PARKED`.

Priority inside a phase: **P0** must ship for the phase to count as done,
**P1** should ship, **P2** is a bonus.

---

## 1. Phase 0 — Foundations (week 1)

Not user-facing features, but nothing else works without them.

| ID | Feature | Priority | Status |
|---|---|---|---|
| XC-1 | **Auth with a two-email allowlist.** Google sign-in via Auth.js. Any other email is rejected in the `signIn` callback. | P0 | DONE 24 Nov — sign-in, allowlist and `User` provisioning built 21 Nov, proven in production on a phone 23 Nov; the two-person test passed 24 Nov (rejected before the allowlist, admitted after) |
| XC-2 | **Household scoping.** Every user belongs to a household; every query is filtered by it. Established once, enforced everywhere. | P0 | TODO |
| XC-3 | **App shell.** Sidebar on desktop, bottom tab bar on phone, dark mode, sensible typography, empty states. | P0 | DONE 23 Nov — sidebar and 390px tabs, OS-following dark mode (D21), placeholder dashboard at `/dashboard`; real empty states arrive with the first data |
| XC-4 | **Seed data + demo mode.** A fictional household with 3 months of plausible transactions, loaded by `pnpm db:seed`. Read-only demo login for the public deployment. | P1 | TODO |
| XC-5 | **Installable PWA.** Add-to-home-screen on both phones, app icon, splash, no browser chrome. | P1 | TODO |
| XC-6 | **Error and loading states.** Every screen handles: loading, empty, error, forbidden. | P0 | TODO |

---

## 2. Phase 1 — Finances (the v1 product)

### FIN-1 Accounts — P0

Track where money sits: transaction accounts, savings, cash, credit cards.

- Name, type (transaction / savings / cash / credit), opening balance, colour.
- Current balance = opening balance + sum of transactions.
- Archived accounts are hidden but keep their history.

*Why it matters:* a transaction without an account is a ledger that cannot be
reconciled.

### FIN-2 Transactions — P0

The core record. Everything else is derived from it.

> Status 25 Nov 2026: quick-add, the month list, edit/delete with the 10-second
> undo (soft delete, D27) and the filters are built and verified at 390px.
> Transfers remain.

- Fields: date, amount (signed cents), account, category, merchant/description,
  note, created by, source (`manual` / `import` / `ai`), status
  (`needs_review` / `confirmed`).
- Quick add: amount, category, account, date defaulting to today. Three taps.
- Full edit and delete, with an undo toast rather than a confirm dialog.
- Filter by month, account, category, status; free-text search on description.
- Transfers between own accounts create a linked pair, excluded from
  income/expense totals.

**Acceptance criteria**

- [ ] Adding an expense from the phone takes ≤ 5 seconds and ≤ 4 interactions.
- [x] The amount is stored as integer cents; $12.35 saves as `1235`, never `12.35`.
- [x] A transaction can never be saved without an account and a category.
- [x] Deleting is reversible for 10 seconds.
- [ ] The list never shows another household's rows, under any filter.

### FIN-3 Categories — P0

> Status 25 Nov 2026: management exists at `/categories` — create (name, kind,
> optional parent), rename, archive and restore, one level of subcategories
> enforced server-side. A parent with live children cannot be archived. Archived
> categories keep their history and leave the quick-add list. The starter seed
> still arrives with `db:seed` (XC-4), so it is not built yet.

- Income and expense categories, with one level of subcategories.
- Seeded with a starter set (Groceries, Rent, Utilities, Transport, Eating out,
  Health, Kids, Subscriptions, Income…), editable.
- A category is archived, never hard-deleted, if transactions reference it.

### FIN-4 Budgets — P0

- Monthly allocation per expense category, stored in cents.
- Actuals computed live from transactions — never stored.
- Shows: allocated, spent, remaining, percentage, and an over-budget state.
- Copy last month's budget into this month in one click.
- Unbudgeted spending is visible, not hidden.

**Acceptance criteria**

- [ ] Changing a transaction updates the relevant budget bar without a page reload
      (or on next navigation — no manual refresh step).
- [ ] Over-budget is obvious in under a second (colour plus text, not colour alone).
- [ ] Month boundaries respect `Australia/Melbourne`, not UTC.

### FIN-5 Dashboard — P0

One screen that answers "where are we this month?".

- Month selector with current month default.
- Income, expenses, net for the month.
- Budget progress for the top categories, with a link to all.
- Upcoming and overdue bills.
- Transactions awaiting review (badge count).
- Last 6 months trend, small.

### FIN-6 Bills and recurring expenses — P0

- Name, amount, frequency (weekly / fortnightly / monthly / quarterly / yearly),
  next due date, category, account.
- Mark as paid, which creates the matching transaction.
- Paid history is a query over transactions carrying `billId` (D25), so a
  monthly or quarterly bill's payment is never inferred from amount and date.
- Upcoming (next 30 days) and overdue lists on the dashboard.
- In-app reminder surface; email/push is P2.

### FIN-7 Reports — P1

- Spend by category for a month, as a chart plus a ranked list.
- Month-over-month comparison.
- Top merchants.
- Read-only; no exports from here (export is FIN-10).

### FIN-8 CSV import — P0

Upload a bank CSV from the device, turn rows into transactions, never import the
same row twice.

> **Decided 16 Nov 2026:** in-app upload replaces the Google Drive picker. v1 has
> no OAuth integration beyond sign-in. Drive moves to the backlog as FIN-11.
> The uploaded file is parsed in memory and discarded — only the resulting rows
> and an import record are kept.

- Upload a `.csv` via `<input type="file">` and a server action.
- A CSV parser that handles quoted fields, embedded commas and CRLF line endings.
- Column mapping UI: which column is date, amount, description.
- Preview of the first 20 rows before committing.
- Duplicate detection via a fingerprint (date + amount + normalised description).
- Imported rows land as `needs_review`, not `confirmed`.
- Import history with counts and an undo.
- No file storage: Vercel has no durable disk, and keeping real bank exports is a
  privacy cost with no benefit.

**Acceptance criteria**

- [ ] Running the same import twice creates zero duplicates.
- [ ] A malformed row is reported by row number and skipped, not fatal.
- [ ] A file over the size limit is rejected with a clear message.
- [ ] No uploaded file content is written to disk, logs or the database.

### FIN-9 AI capture — PARKED (Phase 4)

> Cut from the 16-week plan on 24 Nov 2026 (D24) to make room for FIN-12. The
> specification below stands; it returns in Phase 4.

- Photo of a receipt, voice note, or short sentence → draft transaction
  (amount, merchant, date, suggested category).
- Always lands in the review queue; never auto-confirmed.
- Hard monthly spend cap; when reached, the feature explains itself and stops.

### FIN-10 Export — P1

- CSV download of all transactions for a date range, for data ownership and
  backups.

### FIN-12 Income allocation plan — P1

When an income transaction is confirmed, show a suggested split of the deposit
across the household's accounts: bills due in the next 14 days, the savings
target for that deposit, and the remainder to spending. The app recommends; the
user moves the money, optionally recording the transfer pair.

- Triggered by an income transaction (manual, imported or bill), not by a
  calendar boundary.
- Horizon-based: bills due in the next 14 days, never a forecast of irregular
  income.
- One ordered target per account, fixed or percentage; the remainder goes to the
  spending account.
- No bank feeds, no automatic movement, no category rollover.

*Why it matters:* a fortnightly salary and irregular invoices need one
mechanism. The month is where the budget is reviewed; the deposit is where the
decision is made (D23/D24). This is account allocation, not the parked envelope
carry-over.

**Acceptance criteria**

- [ ] A confirmed income row offers a plan; an expense row does not.
- [ ] The plan never recommends spending money the household does not have.
- [ ] Recording the plan creates balanced transfer pairs, excluded from
      income/expense totals.

---

## 3. Phase 2 — Calendar and chores

| ID | Feature | Priority | Status |
|---|---|---|---|
| CAL-1 | Shared events: title, start, end, all-day, location, notes, attendees (one or both people) | P0 | TODO |
| CAL-2 | Recurring events (weekly training, fortnightly bin night, monthly rent) | P0 | TODO |
| CAL-3 | Views: agenda (phone default), week and month (desktop default) | P0 | TODO |
| CAL-4 | Read-only ICS feed URL so the household calendar appears in Google/Apple Calendar | P1 | TODO |
| CAL-5 | "What's on this week" card on the dashboard | P1 | TODO |
| CHO-1 | Recurring chores with an interval and a next-due date | P0 | TODO |
| CHO-2 | Assignment or alternation between the two people | P0 | TODO |
| CHO-3 | Complete a chore → history, streak, "last done by" | P1 | TODO |
| CHO-4 | "Due today" and "overdue" surfaces, shared with the dashboard | P0 | TODO |
| CHO-5 | Fairness view: who has done what this month | P2 | TODO |

## 4. Phase 3 — Meals and groceries

| ID | Feature | Priority | Status |
|---|---|---|---|
| MEA-1 | Recipes: title, servings, ingredients (name, quantity, unit), method, tags, photo | P0 | TODO |
| MEA-2 | Weekly meal plan grid: assign a recipe to a day and meal slot | P0 | TODO |
| MEA-3 | Scale a recipe by servings | P1 | TODO |
| MEA-4 | "Tonight" card: what is planned, with a link to the recipe | P0 | TODO |
| MEA-5 | Recipe import from a URL, parsed into ingredients | P2 | TODO |
| GRO-1 | Shared grocery list: add, edit, delete, tick off, realtime between two devices | P0 | TODO |
| GRO-2 | Generate a list from the week's meal plan, aggregated and de-duplicated | P0 | TODO |
| GRO-3 | Group items by aisle/section, configurable order | P1 | TODO |
| GRO-4 | Staples list that can be added in one tap | P1 | TODO |
| GRO-5 | Estimated cost of the list, compared with the remaining grocery budget | P2 | TODO |

The meal plan → grocery list link is the highest-value idea in the whole app:
it removes a weekly planning conversation entirely.

## 5. Phase 4 — Exercise, AI, polish

| ID | Feature | Priority | Status |
|---|---|---|---|
| EXE-1 | Weekly training template: day, session type, duration, notes | P0 | TODO |
| EXE-2 | Today's session on the dashboard, with the previous session for context | P1 | TODO |
| EXE-3 | Log a completed session; week streak | P1 | TODO |
| AI-1 | Text capture: "spent $42 on petrol" → draft transaction | P1 | TODO |
| AI-2 | Receipt photo capture | P1 | TODO |
| AI-3 | Voice note capture, transcribed then parsed | P1 | TODO |
| AI-4 | Monthly AI budget cap with visible remaining allowance | P0 | TODO |
| XC-7 | Settings: household name, members, categories, notification preferences, delete account | P0 | TODO |

---

## 6. Cross-cutting behaviour

Applies to every feature, every time.

| Concern | Requirement |
|---|---|
| **Mobile** | Usable one-handed at 390px. Primary action reachable by thumb. |
| **Desktop** | Uses the extra width: tables, side-by-side panels, keyboard shortcuts. |
| **Validation** | Zod schemas shared between client and server; server is authoritative. |
| **Empty state** | Explains what will appear here and offers the first action. |
| **Errors** | Human sentence, what to do next, no stack traces on screen. |
| **Accessibility** | Keyboard reachable, focus visible, labels on inputs, contrast AA. |
| **Money display** | `$1,234.50` with tabular numerals, negatives in red with a minus sign. |
| **Dates** | Human ("Tue 18 Nov"), never raw ISO in the UI. |
| **Performance** | Dashboard interactive under 2s on 4G; no layout shift. |

---

## 7. Things we are explicitly not building yet

Kept here so they stop being re-suggested:

- Bank feeds / open banking / Plaid-style aggregation.
- Automatic receipt line-item breakdown (only totals, for now).
- Push notifications to phones (in-app only).
- Recurring budget rollover and envelope carry-over. (FIN-12 is a different
  thing: splitting a deposit across accounts, not carrying category budgets
  forward.)
- Multi-currency.
- Net worth and investment tracking.
- Document storage; uploads are parsed and discarded, never kept.
- Shared accounts with anyone outside the household.

## 8. Backlog (parked, not scheduled)

- FIN-11 **Google Drive import** (Phase 2, P2) — pick a spreadsheet through the
  Google Picker instead of uploading a CSV. Parked 16 Nov 2026; the OAuth work is
  deferred until calendar integration needs it anyway.
- WhatsApp / SMS bot to capture entries.
- Shopping list that reorders itself by supermarket aisle layout per store.
- "Subscription audit" — detect and flag forgotten subscriptions.
- Savings goals with progress against budget surplus. Superseded for v1 by the
  single household savings target (D26); revisit after FIN-12 ships.
- Bill splitting between the two people ("you owe me $40").
- Meal plan generated from what is already in the pantry.
- Annual summary ("here's the year in money").
- Photo of a whiteboard or paper list → items.
- Location reminder when arriving at the supermarket.

## 9. Adding a feature

1. Write it here with an ID and a priority.
2. Decide which phase it belongs to.
3. If it changes the data model, update `03-architecture.md` first.
4. Only then write code.
