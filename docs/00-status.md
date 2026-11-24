# 00 — Status

> **Read this first.** One page: where the project is, what is settled, what is
> open. Everything else in `docs/` is reference. Rewritten at the close of every
> session, alongside `07-handover.md`.
>
> If you cannot state POSITION in one line after reading this, read
> `04-roadmap.md` before you say anything.

---

**POSITION:** Week 2 complete (schema + transactions list) · **Week 3 started** —
the quick-add expense form is shipped; edit/delete with undo, category management
and filters remain · deployed with the Phase 1 schema.

**Deployed at:** `https://life-organiser-eight.vercel.app` (auto-deploys from
`main`; production data on the Neon `production` branch).

| | |
|---|---|
| **Done** | Database on Neon (19 Nov) · Auth.js + allowlist (20 Nov) · `User` provisioning (21 Nov) · separate `dev` data branch (23 Nov) · app shell closed against XC-3 (23 Nov) · **deployed and signed in from a phone (23 Nov)** · **two-person allowlist test (24 Nov)** · **Phase 1 finance schema + production migration (24 Nov)** · **transactions list (24 Nov)** · **quick-add expense form (24 Nov)** |
| **In progress** | Week 3 — edit/delete with a 10-second undo, category management, filters |
| **Not started** | The rest of Week 3 · bills (W8), CSV import (W9), income allocation (W10), hardening (W11) |
| **Unverified** | The quick-add form on the deployed app: production has no accounts or categories yet, so it shows the setup note · transfer pairing in CSV import · the two-tier ledger for imported rows |

## Awaiting decision

Each of these must be put to Anthony in the standard shape — the decision, two or
three options, a recommendation stating what it entails and why, the cost to
reverse. Never as a bare question.

1. **Week 3 edit/delete: the undo model and whether to introduce shadcn/ui now.**
   D19 deferred shadcn; the dialog and toast are the first real use. The 10-second
   undo needs either a soft delete or a client-side delayed delete — a data-model
   choice, not syntax.
2. **The two-tier ledger** (`needs_review` / `confirmed`): whether the monthly
   overview counts imported rows before review. Deferred from 21 Nov; it now
   affects real numbers.

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

**When a document and the live system disagree, the live system wins — say so and
ask.** Neon, Google Cloud and Vercel hold state this repository cannot see. A
patch of this repo is not evidence about any of them.

## Housekeeping

- **`ALLOWED_EMAILS` is now type Config** (recreated 24 Nov; one Production row,
  readable with Reveal Value). The value holds both addresses. The Secret type
  was the cause of the 24 Nov lockout — keep this one Config.
- **The `dev` branch carries a temporary fixture:** 3 accounts, 6 categories,
  3 budget periods and 26 fictional transactions (25 fixture rows plus one
  quick-add test). Delete it after the first real data import. Production has
  **0** finance rows.
- **`pnpm db:seed` remains deferred** until the demo household exists (XC-4); a
  second household would break `provisionUser`'s single-household rule.
