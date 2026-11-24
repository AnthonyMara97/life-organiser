# 07 — Session Handover

**Last updated:** 24 November 2026, end of the Tuesday session.
**Week 1 and Week 2 are complete.** Week 3 has started: the quick-add expense
form works.
**Next action:** decide the undo model and whether to introduce shadcn/ui, then
finish Week 3's edit/delete, categories and filters.
Run `git status -sb` before anything else.

> **Position lives in `docs/00-status.md`.** Read that first: one page, the
> milestone and build item, the settled decisions (`D1`–`D26`) and what is still
> open. This file is the detail behind it. A decision that appears in
> `00-status.md` as settled is settled — cite it, do not re-open it.

---

## 0. Start here

### 0.1 What landed today

- **The two-person allowlist test closed.** Anthony's wife signed in **before**
  her address was in `ALLOWED_EMAILS` and got our `?error=AccessDenied` page with
  the household message; after the address was added and the deployment was
  redeployed, she reached the dashboard. Both accounts now work. XC-1 is done.
- **The budget period question is settled (D23–D26):** monthly periods, with
  allocation triggered by each income event; FIN-12 is P1 and AI capture is cut
  from the 16-week plan; `Transaction.billId`; a single household savings target.
- **The Phase 1 finance schema exists:** `Account`, `Category`, `Transaction`,
  `BudgetPeriod`, `BudgetLine`, `Bill`, `ImportBatch`, `AiUsage`, with the enums,
  indexes, `billId`, `fingerprint` and the savings target. Migration
  `20261124002343_phase1_finances`.
- **The migration was applied to production** with the **direct** connection,
  not the pooled one, and verified: 1 household, 2 users, 0 finance rows.
- **The transactions list exists** at `/transactions`: server-rendered, month
  filter (Melbourne boundaries), 20-row pagination, net total, empty/loading/error
  states, 390px checked.
- **The quick-add expense form exists** on the same page: amount, date, account,
  category, description; Zod on the server; dollars parsed to integer cents;
  money out stored negative; errors keep the submitted values; success redirects
  to the transaction's month.
- **Pushed.** `main` and `origin/main` are level at the session-close commit.

### 0.2 What is deployed

| Piece | Value |
|---|---|
| Domain | `https://life-organiser-eight.vercel.app` |
| Vercel project | `marafioti/life-organiser`, auto-deploys on push to `main` |
| Database | Neon branch `production`, **pooled** connection, `sslmode=verify-full` |
| Env vars | `DATABASE_URL`, `AUTH_SECRET`, `ALLOWED_EMAILS`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — **Production only** (D22) |
| Google redirect URIs | `https://life-organiser-eight.vercel.app/api/auth/callback/google`, `http://localhost:3000/…`, `http://127.0.0.1:3000/…` |
| Build command | `package.json`'s `build` → `prisma generate && next build`; no Vercel override |
| Production migration | `20261124002343_phase1_finances` applied 24 Nov with the **direct** production string |
| Production rows | 1 household, 2 users, **0** accounts/transactions/budget periods/bills |

Verified from outside with no session: `/` and `/dashboard` return 307 to
`/login`; `/login` renders; `/transactions` returns 307 to `/login`;
`/api/auth/providers` reports exactly the callback URI above. Changing any env
var requires a redeploy before it takes effect.

### 0.3 Still open, and what Week 3 needs

**The undo model and shadcn/ui** — the next blocking decision. FIN-2 says a
delete is reversible for 10 seconds. That needs either a soft delete
(`deletedAt` and a filter everywhere) or a client-side delayed delete (the row
is removed from the UI, the database delete is scheduled, undo cancels it). The
roadmap also says to use shadcn's dialog here; D19 deferred shadcn and this is
its first real use. Put the decision in the standard shape before building the
edit/delete step.

**The two-tier ledger** (`needs_review` / `confirmed`) — still open from 21 Nov.
It now affects real numbers: if the monthly overview ignores unreviewed imported
rows, it understates spending; if it counts them, it is complete but unreconciled.
Decide before CSV import (W9).

**`db:seed` is still deferred** until the demo household exists (XC-4): a second
household would break `provisionUser`'s exactly-one-household rule. The page is
verified with a **temporary fixture** in `dev` instead: 3 accounts, 6 categories,
3 budget periods, 26 fictional transactions (25 fixture rows + one quick-add
test). Delete it after the first real data import — Anthony's instruction.

**`ALLOWED_EMAILS` is still type Secret** (write-only) unless it has been
recreated. The value holds both addresses, but the type caused today's lockout:
the edit form shows an empty value and saving replaces the whole list. Recreate
it as **Config** when convenient; it is an email list, not a credential.

---

## 1. What the working mode is

- This is a **shipping project** that teaches **software architecture** — how the
  pieces fit and why. It does **not** teach coding. No syntax lessons, no
  walkthroughs, no read-backs.
- **One architectural concept per session**, two or three sentences, tied to the
  code in front of him.
- **Decisions belong to Anthony.** Present the decision, two or three options, a
  recommendation with what it entails and what could go wrong, the cost to
  reverse. Then stop. `AGENTS.md` has the full shape.
- **Check whether it is already decided.** `00-status.md` lists D1–D26; if a row
  answers it, cite the ID and move on.
- **Review before commit.** Show what changed and why, in plain English, then
  commit. One logical change per commit.

---

## 2. Where things stand

| Thing | State |
|---|---|
| Planning docs | ✅ Committed |
| Machine setup | ✅ WSL Ubuntu + nvm + Node 26 + pnpm |
| Next.js scaffold | ✅ Builds, typechecks, lints |
| `src/lib/dates.ts` | ✅ Day arithmetic, month bounds, Melbourne "today", labels; tests |
| `src/lib/money.ts` | ✅ `formatCents` and `parseCents`; tests |
| Prisma | ✅ 7.10.1, client generated, CLI loads `.env.local` |
| Prisma driver adapter | ✅ `@prisma/adapter-pg@7.10.1` + `pg@8.23.1`, in `src/lib/db.ts` |
| Database | ✅ Neon project, Sydney. `production` (deployed) and `dev` (local). Same two migrations on both |
| Google OAuth client | ✅ Created 19 Nov, Publishing status Testing |
| **Auth.js** | ✅ `next-auth@5.0.0-beta.32`, pinned exactly |
| Allowlist | ✅ Enforced server-side in `signIn`; 8 tests; both household accounts proven 24 Nov |
| Sign-in page | ✅ `/login` renders and redirects to Google |
| `Household` row | ✅ One per branch; `production` copied into `dev` |
| `User` provisioning | ✅ Built and verified 21 Nov; production has 2 users |
| App UI | ✅ Shell closed against XC-3 on 23 Nov |
| Finance schema | ✅ Migration `20261124002343_phase1_finances`; applied to both branches |
| Transactions list | ✅ `/transactions`, month filter, pagination, total, states |
| Quick-add form | ✅ Expense only; Zod + server action; verified locally |
| Deployment | ✅ Live; Phase 1 schema on production; `/transactions` behind auth |
| GitHub remote | ✅ `github.com/AnthonyMara97/life-organiser` |
| `db:seed` | ⏸ Deferred until XC-4 (demo household) |
| Roadmap | ✅ 6 hours/week, 16 weeks; W10 is income allocation, AI moved to Phase 4 |

Commit history, newest first:

```
9beca09 feat(transactions): add the quick-add expense form
105bc67 docs: record monthly periods, FIN-12 and the bill link
26474b4 feat(transactions): add the month list with a running total
f83bf65 feat(db): add the Phase 1 finance schema
fbd57f3 docs: finish the Week 1 handover for the next agent
af81d67 docs: close Week 1 — deployed, signed in on a phone
46b87da docs: close XC-3, record D21 and put accounts in the folder tree
```

`main` and `origin/main` were level at the close commit.

---

## 3. Next actions, in order

1. **Decide the undo model + shadcn/ui** (standard shape) — blocks edit/delete.
2. **Finish Week 3:** edit and delete with the 10-second undo; category
   management with archive; filters (account, category, status, text).
3. **Decide the two-tier ledger** before CSV import.
4. **Add `db:seed` only when the demo household exists** (XC-4). A second
   household needs an `isDemo` flag and per-user household resolution first.
5. **Recreate `ALLOWED_EMAILS` as Config**; it is still write-only.
6. **Delete the dev fixture** after the first real data import.
7. **Production migrations:** use the **direct** production string, not the
   pooled one. The Vercel `DATABASE_URL` is pooled and cannot run DDL.

---

## 4. The machine, as it actually is

Everything lives inside Ubuntu, not Windows.

| Thing | Value |
|---|---|
| Distro | Ubuntu on WSL2, user `anthony` |
| Project path (Linux) | `/home/anthony/repos/life-organiser` |
| Project path (Windows) | `\\wsl.localhost\Ubuntu\home\anthony\repos\life-organiser` |
| Node | v26.13.1 LTS via nvm (`~/.nvm`) |
| pnpm | 12.21.0 · npm 11.20.0 · nvm v0.41.0 · git 2.55.0 |
| git identity | `AnthonyMara97`; repo overrides email to the GitHub no-reply address |
| GitHub CLI | ❌ Not installed |
| Docker / `psql` / `neonctl` | ❌ Not installed — the SQL editor is the way in |
| SSH key | `~/.ssh/id_ed25519`, **passphrase-protected** |
| Remote | `git@github.com:AnthonyMara97/life-organiser.git` (public) |

### The database

| Thing | Value |
|---|---|
| Provider | Neon, free tier, project `life-organiser` |
| Region | AWS `ap-southeast-2` (Sydney) |
| Database / role | `neondb` / `neondb_owner` |
| Branches | `dev` (local development) and `production` (the deployed app) |
| Local connection | branch `dev`, **direct**, `sslmode=require` |
| Deployed connection | branch `production`, **pooled** (`-pooler`), `sslmode=verify-full`, in Vercel |
| Migrations | `20261119044104_init`, `20261124002343_phase1_finances` — applied to both |
| Production migration URL | the **direct** production string, never the pooled Vercel one |
| Household row | ✅ one per branch |
| User rows | ✅ 2 in production |
| Finance rows | ✅ 0 in production; 26 fictional rows in `dev` (fixture) |

Pooling is deliberately **off** in the local URL: `prisma migrate` cannot run
through a pooled connection. The deployed app takes the pooled production
string, where pooling keeps many short-lived serverless connections from
exhausting Postgres. Migration commands need the **direct** production string.

### Behaviours that waste time if forgotten

1. **`node` only exists in an interactive shell.** Use
   `wsl -d Ubuntu -- bash -ic '...'`, not `bash -lc`. Verify with `node -v`
   before blaming a script.
2. **PowerShell eats `$`, `|` inside quotes, and `<`/`>` in arguments.** Write a
   short `.sh` to `/mnt/c/Users/amara/AppData/Local/Temp/opencode/` and run it
   with `wsl -d Ubuntu --cd /home/anthony/repos/life-organiser -- bash
   /mnt/c/.../x.sh`. Scripts should `[ -f package.json ]` rather than `cd`.
3. **The push needs Anthony's passphrase once per WSL session — set the agent up
   immediately, then never ask again.** The fixed socket is `/tmp/ssh-agent.sock`.
   Check `SSH_AUTH_SOCK=/tmp/ssh-agent.sock ssh-add -l` first; if the key is
   listed, just push. To unlock, launch a WSL window running:
   ```bash
   ssh-agent -a /tmp/ssh-agent.sock
   SSH_AUTH_SOCK=/tmp/ssh-agent.sock ssh-add ~/.ssh/id_ed25519
   read -p "Press Enter to close..."
   ```
   Then every push uses `SSH_AUTH_SOCK=/tmp/ssh-agent.sock git push origin main`.
   Anything that talks to the remote (`ls-remote`, `fetch`) needs the socket too,
   or it waits for a passphrase no agent can type.
4. **`pnpm build` writes to stderr on success**, and **`pnpm add` prints a red
   `ERR_PNPM_IGNORED_BUILDS` even when the package installs.** Read the exit
   path, not the colour.
5. **Do not run `pnpm build` against a live `pnpm dev`.** They share `.next`;
   stop dev first (`pkill -f "next dev"`), then build.
6. **GitHub rejects commits exposing a private email (GH007).** Check
   `git log -1 --format=%ae` before blaming the key.
7. **pnpm blocks install scripts** (`allowBuilds` in `pnpm-workspace.yaml`).
   `prisma`, `@prisma/engines` and `esbuild` are approved. A new package needing
   a postinstall stops the install — ask first.
8. **`cd` inside a script run as `bash /tmp/x.sh` fails** with ENOENT. Use
   `--cd` on the `wsl` command.
9. **Non-interactive shells have no `node`.** Source nvm in the script.
10. **Prisma prints a Node support warning on Node 26.** It proceeds.
11. **PowerShell 5.1 rejects `&&`** and expands `$` in double-quoted arguments.
    One command per call, or the script-file workaround.
12. **Prisma's `env()` treats an empty string as missing**, so a blank
    `DATABASE_URL=""` fails with `PrismaConfigEnvError`.
13. **`.env.local` is the only place the dev connection string lives.** Do not
    print it or paste it into chat. The same applies to `AUTH_GOOGLE_SECRET` and
    `AUTH_SECRET`; the client id is public.
14. **`localhost:3000` is the host with the browser session.** `127.0.0.1:3000`
    was blocked for Next dev resources on 24 Nov (cross-origin HMR). Use
    `localhost` for the authenticated dev app.
15. **`pg` warns about `sslmode=require`** on every run; it currently behaves as
    `verify-full`. The local `dev` string still says `require`; production says
    `verify-full`.
16. **Production migrations need the direct branch string.** The Vercel
    `DATABASE_URL` is pooled (`-pooler`) and `prisma migrate deploy` cannot run
    DDL through it. Put the direct string in `.env.production.local` (ignored),
    use a temporary config that loads **that** file, run `prisma migrate deploy
    --config tmp-prisma.production.config.ts`, then delete both. Never let
    `prisma.config.ts` load `.env.local` for this.
17. **The `.env.production.local` line is just the connection string.** Anthony
    pasted the whole `DATABASE_URL=...` assignment after the key on 24 Nov, so
    the value started with `DATABASE_URL="…"`. Normalise before use; do not print
    the value.
18. **`ALLOWED_EMAILS` was a Secret** and Secret values are write-only: the edit
    form shows an empty field and saving replaces the whole list. That locked
    both users out on 24 Nov. Recreate it as **Config** when convenient.
19. **Vitest needs the `@/` alias.** `vitest.config.mts` maps `@` to `./src`;
    without it, a tested module that imports `@/lib/...` fails only under test.

---

## 5. What was actually done

### 24 November — Tuesday

**Allowlist and access**

- His wife signed in before her address was added: Google let her through (she
  was already a test user), our `signIn` callback returned false, and she saw
  `/login` with *"That account is not on the household allowlist."* No `User`
  row was created. That is the rejection evidence XC-1 lacked.
- The Vercel `ALLOWED_EMAILS` turned out to be a **Secret**, so the value was
  never visible; Anthony had replaced it with her address and locked both users
  out. The value now holds both addresses, and both accounts reach the dashboard.
- The variable is still type Secret. Recreate as Config (see §0.3).

**Decisions**

- **D23:** monthly budget periods, with allocation triggered by each income
  event. The month is the reporting frame; the deposit is the action frame.
- **D24:** FIN-12 income allocation is P1 Phase 1; AI capture is cut from the
  16-week plan.
- **D25:** `Transaction.billId`, so paid-bill history is a query.
- **D26:** one household savings target (amount + date), no goals module.

**Schema and migration**

- Added `Account`, `Category`, `Transaction`, `BudgetPeriod`, `BudgetLine`,
  `Bill`, `ImportBatch`, `AiUsage`, the enums, `billId`, `fingerprint`, the
  savings target and the indexes.
- `prisma migrate dev --name phase1_finances` created
  `20261124002343_phase1_finances` and applied it to `dev`.
- Applied it to `production` with the **direct** string and verified
  `migrate status` and row counts. The Vercel deploy was already live, so the
  migration came before the code that needs it.
- Fixed a paste mistake in `.env.production.local` without printing the value;
  the file and temp config were deleted after use.

**Transactions list**

- `src/server/transactions.ts`: household-scoped month query, count, sum and
  pagination; `getQuickAddOptions` for active accounts and expense categories.
- `src/app/(app)/transactions/page.tsx`: server component, month nav, table,
  net total, pagination, empty/loading/error states.
- `src/lib/dates.ts`: `todayInTimeZone`, `monthBounds`, `isMonth`, `isoDay`,
  `formatDayLabel`, `formatMonthLabel`; tests for DST, leap years and invalid
  input.
- `src/lib/money.ts`: `formatCents`, then `parseCents`; tests for the shapes
  people type and for rejecting a third decimal.
- Verified at 390px and desktop; month fallback for an invalid month; page 2 of
  25 rows.

**Quick-add expense form**

- `src/lib/validation/transactions.ts`: Zod schema; impossible days rejected.
- `src/actions/transactions.ts`: session → household, Zod, account/category
  re-check, `parseCents`, store negative cents, `revalidatePath`, redirect to the
  transaction's month.
- `src/components/transactions/quick-add-form.tsx`: client form with
  `useActionState`; per-field errors; submitted values preserved on error by
  remounting the form with the returned values.
- Verified locally: invalid amount shows the error and keeps the typed values;
  a valid $12.34 expense appears as −$12.34 and moves the net from $2,608.10 to
  $2,595.76.
- Added `vitest.config.mts` so `@/` imports resolve under test.

**Verification**

- `pnpm typecheck`, `pnpm lint`, `pnpm test` — **47 tests** pass.
- `pnpm build` passes with `/transactions` dynamic.
- Production: `/transactions` 307 to `/login`; `/login` 200; migration status up
  to date.
- Pushed all commits; `main` and `origin/main` level at the close commit.

---

## 6. What to read, in what order

| File | Why |
|---|---|
| `docs/00-status.md` | **The position**, settled decisions and open questions. Read first |
| `AGENTS.md` | Standing rules. Overrides general defaults |
| This file | The detail behind the status page |
| `docs/05-working-agreement.md` | How decisions are made and what "done" means |
| `docs/04-roadmap.md` | Is the request the current milestone? |
| `docs/03-architecture.md` | Is there a recorded decision this contradicts? |
| `docs/01-product-brief.md`, `docs/02-features.md` | Is this existing scope or new? |

`docs/06-learning-log.md` is frozen. Read it for history only.

---

## 7. The session's architectural concept

**A period is an aggregation window; a deposit is an event.** The month is where
totals are compared and the budget is reviewed; the deposit is where a decision
is made about what to do with the money. Keeping those separate is why one model
handles a fortnightly salary and irregular invoices without inventing a period
for each. The quick-add form makes the matching point about boundaries: the
browser sends a request, and the server re-derives the household, the account,
the category and the cents before anything is written.
