# 01 — Product Brief

> Status: draft for review · Last updated: 16 Nov 2026
>
> Items marked **(confirm)** are assumptions that need a yes/no from Anthony
> before the roadmap is locked.

---

## 1. One-liner

Life Organiser is the single place where a two-person household keeps track of
money, meals, groceries, chores, appointments and training — so neither person
has to hold it all in their head.

## 2. The problem

Household admin is not hard, but it is **constant, fragmented and invisible**:

1. **Fragmentation.** Information lives in a bank app, a notes app, a shared
   spreadsheet, a shopping list on the fridge and someone's memory. Answering
   "can we afford this?", "what's for dinner?", "did the rego get paid?" means
   checking five places or asking the other person.
2. **Invisible mental load.** The person who remembers is doing unpaid
   administrative work. When the remembering is spread across tools, it is hard
   to see who is carrying it, so it tends to stay with one person.
3. **Hindsight only.** Money is reviewed at the end of the month, after the
   spending happened. There is no live view of "we have $180 left for groceries
   and it's the 22nd".
4. **Capture friction.** The moment to record something is at the checkout or in
   the car, one-handed, holding a phone. If capturing takes more than a few
   seconds, it does not happen, and the system dies.

**The design response:** one shared source of truth, capture in seconds on a
phone, deeper planning on desktop, and a review queue so nothing has to be
categorised perfectly at the moment of capture.

### Current state **(confirm)**

How these are handled today, to be written down before build starts:

| Area | Today | Pain |
|---|---|---|
| Money | UNKNOWN | UNKNOWN |
| Meals | UNKNOWN | UNKNOWN |
| Groceries | UNKNOWN | UNKNOWN |
| Chores | UNKNOWN | UNKNOWN |
| Appointments | UNKNOWN | UNKNOWN |
| Training | UNKNOWN | UNKNOWN |

## 3. Who it is for

| | |
|---|---|
| **Primary users** | Two adults in one household in Westmeadows, VIC |
| **Accounts** | One per person, so entries show who added them **(confirm: separate logins, not a shared account)** |
| **Primary device** | Phone — capture, check, tick off |
| **Secondary device** | Desktop — planning, budgets, reports, bulk edits |
| **Explicitly not for** | The public, friends, family, clients, tenants. There is no sign-up. |

The public GitHub repository exists for **employers**, not for users. It shows
the code, the architecture, the decision-making and a seeded demo — never the
household's real data.

## 4. Design principles

1. **Five-second capture.** If recording an expense or a grocery item takes
   longer than five seconds, the design is wrong.
2. **Capture now, organise later.** Everything lands in a review queue with a
   sensible guess attached. Perfection is never a prerequisite for saving.
3. **Phone captures, desktop plans.** Mobile screens are for quick actions and
   at-a-glance answers. Dense tables, bulk editing and charts are desktop-first.
4. **One fact, one home.** A grocery item exists once. A transaction exists once.
   No duplicate entry, no manual syncing between screens.
5. **Answer a question, don't display data.** "How much is left for groceries?" is
   a better screen than a table of 400 rows.
6. **Private by default.** Deny by default, allowlist explicitly, and never mix
   real data into anything public.
7. **Boring and explainable.** Every technique used must be one the owner can
   explain aloud in an interview.

## 5. Goals for v1

**The stated financial goal (15 Nov 2026):** build a savings buffer in preparation
for a baby. Success is measured by **savings rate and progress towards that fund**,
not by how much data is captured.

The app must outlive the goal, so the goal itself is configuration — a target
amount and a target date — not something hard-coded into the design.

The mechanics below have not yet been re-prioritised against this goal.
**(proposed: revise once the automation design is agreed.)**

Ordered by priority. v1 means "finances working, live, used weekly".

| # | Goal | Measure |
|---|---|---|
| G1 | Know the month's position at a glance | Open the dashboard and answer "how much have we spent, and what's left per category" in under 10 seconds |
| G2 | Capture spending without friction | A cash purchase is recorded in under 5 seconds on a phone |
| G3 | Keep the budget live | Budget vs actual updates the same day as spending, with no manual reconciliation |
| G4 | Nothing gets paid late | Every recurring bill has a due date and shows as upcoming or overdue |
| G5 | Data is ours | Full CSV export of all transactions at any time |
| G6 | It runs on both devices | Same account works on phone (installable) and desktop |
| G7 | The household adopts it | Both people use it for 4 consecutive weeks without falling back to the old method |

The remaining domains (calendar, chores, meals, groceries, exercise) inherit
goals in Phase 2 onward. Success for those is "fewer conversations that start
with *did you…?*".

## 6. Non-goals

Explicitly out of scope. Listing these prevents drift.

- **Not a bank.** No direct bank feeds or open banking in v1. Imports are file
  based (a CSV export uploaded in the app).
- **Not accounting software.** No tax returns, invoicing, GST, business
  bookkeeping, double-entry ledger.
- **Not a multi-tenant product.** No sign-up, no billing, no admin panel, no
  roles beyond "member".
- **Not a native mobile app.** A responsive, installable web app. No App Store.
- **Not a social or sharing product.** No invitations, no public links.
- **Not a document vault.** The app never stores uploaded files: an import is
  parsed in memory and discarded. There is no file library.
- **Not offline-first.** v1 requires a connection; offline caching is a later
  consideration.
- **No real financial data in the repository.** Ever.

## 7. Success criteria

### As a personal tool

- Both people open it at least 3 times a week after week 6.
- The monthly budget is reviewed in it, not in a spreadsheet.
- Nothing is tracked in two places.

### As a portfolio piece

- Deployed and publicly reachable, with a one-click demo account.
- `README.md` that a recruiter can skim in 60 seconds: what it does, screenshots,
  stack, one architecture diagram, how to run it.
- Seeded demo data that looks like a real household, not `lorem ipsum`.
- A short write-up of two or three genuinely interesting problems solved (money
  precision, idempotent CSV import, defensively parsing untrusted files, AI cost
  capping).
- Clean commit history and docs that show engineering judgement.
- The owner can **explain every part of it** without notes.

## 8. Constraints and assumptions

| Constraint | Value |
|---|---|
| Timeline | 3 months, 15 Nov 2026 → mid Feb 2027 |
| Effort | **~8–10 hours/week assumed (confirm)** — ~110 hours total |
| People | One developer learning, paired with an AI assistant |
| Budget | $0–10 AUD/month running cost. Free tiers for hosting and database |
| Hard deadline pressure | Graduate Certificate starts Feb 2027, so v1 should be live and stable **before** study begins |
| Existing skills | Business/operations background, strong spreadsheet and process discipline, new to programming |
| Hardware | Assume one personal computer plus two phones |

## 9. Privacy and data rules

1. The **repository is public, the data is not.** No real transaction, receipt,
   address, balance, calendar entry or name of a real person appears in git.
2. **Two allowlisted emails.** Sign-in attempts from anyone else are rejected at
   the auth callback, not merely hidden in the UI.
3. **Least data kept.** Imports are parsed in memory and discarded; the app keeps
   only the resulting transactions and an import summary. No OAuth access to a
   cloud drive, and no copy of a bank export at rest.
4. **No card numbers, no bank credentials, no IDs.** The app stores amounts,
   dates, merchants and categories — not account numbers.
5. **Deletable.** Any account can be deleted along with all of its rows; export
   comes first.
6. **No third-party analytics** on authenticated screens.
7. AI features send **only the minimum text needed** and never a whole ledger.
   Prompts are logged as token counts, not as content.

## 10. Questions

### Resolved

| Question | Answer | Date |
|---|---|---|
| Weekly effort | 8–10 hours, two sessions | 15 Nov 2026 |
| Logins | **Separate account per person** | 15 Nov 2026 |
| Bank data | Bank exports **CSV** | 15 Nov 2026 |
| Pay cycle | Anthony **fortnightly**; wife is a sole trader with **irregular income** | 15 Nov 2026 |
| Sync ritual | **Monday**, weekly — the day after the weekend's spending | 15 Nov 2026 |
| Time model | **Three clocks:** weekly sync ritual · fortnightly budget period · per-person income schedule | 15 Nov 2026 |
| Product scope | Built for **two users only**. Generalisation, sign-up and multi-tenancy deferred | 15 Nov 2026 |
| Deadline | None. 13-week plan stands; 15 weeks acceptable; **16 weeks hard cap** | 15 Nov 2026 |
| After February | Decide in January | 15 Nov 2026 |
| Name | Life Organiser | 15 Nov 2026 |
| CSV import source | **Upload in the app**; Google Drive dropped from v1 (FIN-11) | 16 Nov 2026 |

### Open

1. Which bank(s), and what columns does the CSV contain? Worth pasting a header
   row (with amounts removed) before the import milestone.
2. Are bills paid from one account or split between you? Does the budget need a
   "who paid" dimension, or only "household"?
3. **Budget period model** — under review now. Fortnightly, monthly, or two-tier.
   Blocks week 2.
4. What are the two or three meals-related decisions that cause the most
   friction? ("What's for dinner" and "what do we need to buy" are different
   problems.)
5. Which notifications are welcome — in-app only, email, or phone push? Anything
   that feels like nagging will be ignored.
