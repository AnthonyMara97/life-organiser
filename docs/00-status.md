# 00 — Status

> **Read this first.** One page: where the project is, what is settled, what is
> open. Everything else in `docs/` is reference. Rewritten at the close of every
> session, alongside `07-handover.md`.
>
> If you cannot state POSITION in one line after reading this, read
> `04-roadmap.md` before you say anything.

---

**POSITION:** Week 1 of 16 · build item 4 of 4 (the deploy) · next: Vercel
project, production env vars, redirect URI, then the phone sign-in.

| | |
|---|---|
| **Done** | Database on Neon (19 Nov) · Auth.js + allowlist (20 Nov) · `User` provisioning (21 Nov) · separate `dev` data branch (23 Nov) · app shell closed against XC-3 (23 Nov) |
| **In progress** | — |
| **Not started** | Deploy to Vercel · two-person allowlist test |
| **Unverified** | A non-allowlisted sign-in at runtime · the second account (blocked on his wife's Google account) |

## Awaiting decision

Each of these must be put to Anthony in the standard shape — the decision, two or
three options, a recommendation stating what it entails and why, the cost to
reverse. Never as a bare question.

1. **Week 2 blockers, from 21 Nov:** the budget period model (fortnightly,
   monthly, two-tier), the two-tier ledger (`needs_review` / `confirmed`), and
   whether savings goals are P0.

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

**When a document and the live system disagree, the live system wins — say so and
ask.** Neon, Google Cloud and Vercel hold state this repository cannot see. A
patch of this repo is not evidence about any of them.
