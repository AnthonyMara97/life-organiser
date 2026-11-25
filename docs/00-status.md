# 00 — Status

> **Read this first.** One page: where the project is, what is settled, what is
> open. Everything else in `docs/` is reference. Rewritten at the close of every
> session, alongside `07-handover.md`.
>
> If you cannot state POSITION in one line after reading this, read
> `04-roadmap.md` before you say anything.

---

**POSITION:** Week 3 complete and deployed. The account structure is recorded and
the business account settled (D30). The next engineering step is **not** Week 4
yet: the import source is under investigation (CSV vs OFX/QIF/PDF) because real
exports showed the transfer problem is harder than assumed — see
`docs/reference/csv-import-findings.md`. The transfer-category decision is
parked until that comparison is done. **Next: compare export formats, decide the
source, then Week 4.**

**Deployed at:** `https://life-organiser-eight.vercel.app` (auto-deploys from
`main`; production data on the Neon `production` branch).

| | |
|---|---|
| **Done** | Database on Neon (19 Nov) · Auth.js + allowlist (20 Nov) · `User` provisioning (21 Nov) · separate `dev` data branch (23 Nov) · app shell closed against XC-3 (23 Nov) · **deployed and signed in from a phone (23 Nov)** · **two-person allowlist test (24 Nov)** · **Phase 1 finance schema + production migration (24 Nov)** · **transactions list (24 Nov)** · **quick-add expense form (24 Nov)** · **edit/delete with a 10-second undo, soft delete (25 Nov)** · **categories with archive (25 Nov)** · **filters — account, category, status, text (25 Nov)** · **mentor review access (25 Nov)** · **Week 3 deployed to production (25 Nov)** · **six-account structure recorded + business account settled (25 Nov)** · **real-export import investigation (25 Nov)** |
| **In progress** | Import source comparison (CSV vs OFX/QIF/PDF) — decides the format FIN-8 targets. The transfer-category decision is parked until it is done |
| **Not started** | Week 4 (accounts and the dashboard; transfers) · bills (W8), CSV import (W9), income allocation (W10), hardening (W11) |
| **Unverified** | The quick-add form on the deployed app (production has no accounts or categories yet, so it shows the setup note) · edit/delete on the deployed app for the same reason — both were verified locally against `dev` · transfer pairing in any format · the two-tier ledger for imported rows |

## Awaiting decision

Each of these must be put to Anthony in the standard shape — the decision, two or
three options, a recommendation stating what it entails and why, the cost to
reverse. Never as a bare question.

1. **The import source format (next session, first question).** CSV works but has
   no unique transaction id and only keyword-level transfer hints. OFX/QBO would
   provide `FITID` and `TRNTYPE=XFER`; QIF marks transfers by category
   convention; PDF has neither. Evidence and counts in
   `docs/reference/csv-import-findings.md`. Recommendation: prefer OFX if
   Westpac offers it, CSV as the fallback, PDF only if nothing else exists.
2. **How a transfer is recorded (parked until the format decision).**
   `categoryId` is required on every row, so a transfer needs either a nullable
   `categoryId` (recommended, proposed), a system category with a new kind, or a
   normal category that pollutes the reports. A data-model choice, not syntax.
3. **The two-tier ledger** (`needs_review` / `confirmed`): whether the monthly
   overview counts imported rows before review. Deferred from 21 Nov; blocks
   FIN-8, and unpaired transfer legs make it urgent.

## Settled — do not re-ask, do not present as a choice

Full reasoning in `03-architecture.md` §12; environments in §11. Cite the ID.

| ID | Decision |
|---|---|
| D1 | Single Next.js app, no separate API |
| D2 | TypeScript strict |
| D3 | PostgreSQL + Prisma |
| D4 | Money as signed integer cents |
| D5 | Google sign-in with a two-email allowlist |
| D6 | Finances built first |
| D7 | *(superseded by D10)* Drive via Picker + `drive.file` scope |
| D8 | AI capture deferred to Phase 4 |
| D9 | App name: Life Organiser |
| D10 | CSV upload replaces Drive in v1 — reverses D7 |
| D11 | Component caching off |
| D12 | `@types/node` tracks the runtime (^26) |
| D13 | Calendar days are ISO strings; arithmetic in `src/lib/dates.ts` |
| D14 | Neon for dev and production; the CLI uses the direct connection |
| D15 | `next-auth` pinned to `5.0.0-beta.32`, exactly |
| D16 | JWT sessions; `User` row on first sign-in; no Prisma adapter |
| D17 | The single `Household` row is inserted by hand once |
| D18 | `@prisma/adapter-pg@7.10.1` + `pg` as the driver adapter |
| D19 | Plain Tailwind for the app shell; no shadcn/ui in Week 1 |
| D20 | A `dev` Neon branch holds local data; `production` is for the deployed app |
| D21 | Dark mode follows the OS; no in-app toggle |
| D22 | Vercel env vars are Production-only; previews have no database |
| D23 | Monthly budget periods, with allocation triggered by each income event |
| D24 | FIN-12 income allocation is P1; AI capture is cut from the 16-week plan |
| D25 | `Transaction.billId` links a payment to the bill it settles |
| D26 | One household savings target (amount + date); no goals module |
| D27 | Deleting a transaction is a **soft delete** (`deletedAt`); undo clears it |
| D28 | shadcn/ui's dialog and Sonner toast are in, adapted to the role tokens |
| D29 | A third allowlisted address — Anthony's mentor — has review access (extends D5) |
| D30 | Cassidy's business account is an ordinary tracked account; its inflows are household income |

**When a document and the live system disagree, the live system wins — say so and
ask.** Neon, Google Cloud and Vercel hold state this repository cannot see. A
patch of this repo is not evidence about any of them.

## Housekeeping

- **`ALLOWED_EMAILS` is type Config** (recreated 24 Nov; one Production row,
  readable with Reveal Value). The value holds three addresses — Anthony, his
  wife, and his software-development mentor, who reviews the work (D29). The
  Secret type was the cause of the 24 Nov lockout — keep this one Config.
- **The `dev` branch carries a temporary fixture:** 3 accounts, 3 budget periods
  and 26 fictional transactions (25 fixture rows plus the quick-add test), and
  7 categories — 6 active plus **one archived "Test sub"** created and archived
  during the 25 Nov phone verification. Delete the whole fixture after the first
  real data import. Production has **0** finance rows.
- **`pnpm db:seed` remains deferred** until the demo household exists (XC-4); a
  second household would break `provisionUser`'s single-household rule.
- **Production is up to date:** all three migrations are applied, including
  `20261125061937_soft_delete_transactions` (25 Nov, direct connection). The
  temporary `.env.production.local` and its config were deleted after use.
- **Real bank exports live in `.imports/`** — gitignored, never committed, four
  one-month Westpac files (personal, joint spendings, groceries, rainy-day fund).
  `joint-spendings.csv` is a byte-identical duplicate of the personal export;
  delete it. The findings are in `docs/reference/csv-import-findings.md`. Remove
  the folder once the import design is settled.
- **Production has 0 accounts and 0 categories.** Week 4 creates the six accounts
  from the structure in `docs/01-product-brief.md`.
