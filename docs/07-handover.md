# 07 — Session Handover

**Last updated:** 25 November 2026, end of the Wednesday session.
**Week 3 is complete, committed and deployed** (`8ba692e`).
**The next action is a format decision, not Week 4:** compare CSV with OFX/QIF/PDF
before building the importer, because the real exports showed transfer detection
is not safely automatable. The six-account structure is recorded and the business
account settled (D30). Evidence, counts and open questions:
`docs/reference/csv-import-findings.md`.
Run `git status -sb` before anything else.

> **Position lives in `docs/00-status.md`.** Read that first: one page, the
> milestone and build item, the settled decisions (`D1`–`D30`) and what is still
> open. This file is the detail behind it. A decision that appears in
> `00-status.md` as settled is settled — cite it, do not re-open it.

---

## 0. Start here

### 0.1 What landed today

- **Soft delete (D27).** `Transaction.deletedAt`, migration
  `20261125061937_soft_delete_transactions`, applied to `dev` and then to
  `production` (direct string) before the deploy.
  `liveTransactionWhere(householdId)` in `src/server/transactions.ts` is the one
  place `{ householdId, deletedAt: null }` is written; every list, count and sum
  spreads it.
- **Edit.** A shadcn dialog per row: amount as positive dollars plus a Money out /
  Money in choice, so the sign is applied on the server. Archived accounts and
  categories are allowed on edit (old rows stay fixable) but not on create. The
  update is an `updateMany` scoped by household and `deletedAt: null`, so a stale
  form cannot revive a row deleted in another tab.
- **Delete with undo.** No confirm dialog. The row leaves the list optimistically,
  the delete writes `deletedAt`, and a toast offers Undo for 10 seconds. Undo
  clears the column. Verified: count 26→25, net $2,595.76→$2,608.10, undo back to
  26 and $2,595.76, and the row really held `deletedAt` in Postgres between the
  two.
- **Categories (FIN-3).** `/categories`: create (name, expense/income, optional
  parent), rename, archive, restore; one level of subcategories enforced
  server-side. A parent with live children cannot be archived (disabled button
  plus a server check). Archived categories keep their history and leave the
  quick-add list; the filter lists still show them, labelled "(archived)".
- **Filters (FIN-2).** Account, category, status and free-text search (description,
  merchant, note; case-insensitive in Postgres). The count, net total and
  pagination all follow the filters; month and page links keep them.
- **shadcn/ui (D28).** Dialog and Sonner toast, copied in and mapped to the
  project's role tokens so D21 still holds. Four dependencies added:
  `@radix-ui/react-dialog`, `sonner`, `clsx`, `tailwind-merge`.
- **Two bugs found by the phone check and fixed:** the table's Delete button sat
  off the right edge at 390px (actions now live under the description below `md`),
  and Sonner ignored the 80px offset under 600px and covered the tab bar
  (`mobileOffset` now set too).
- **The six-account structure was recorded** in `docs/01-product-brief.md`: his
  personal, Cassidy's personal, Cassidy's business, joint spendings, groceries,
  and the rainy-day fund. Bills and the mortgage are paid from joint spendings —
  that closes the brief's old “one account or split” question.
- **D30: Cassidy's business account is an ordinary tracked account.** Tax and GST
  are handled by her accounting software before money reaches it, so its inflows
  are household income and no exclusion rule is needed.
- **The import question was investigated with real exports** and is bigger than
  assumed. Four one-month Westpac files showed two different formats, two date
  formats, opposite row orders, no usable unique id, and transfer matching that
  produced false positives. Full counts and recommendations:
  `docs/reference/csv-import-findings.md`.

### 0.2 What is deployed

| Piece | Value |
|---|---|
| Domain | `https://life-organiser-eight.vercel.app` |
| Vercel project | `marafioti/life-organiser`, auto-deploys on push to `main` |
| **Deployed code** | The **25 Nov** build (`8ba692e`), auto-deployed from `main` |
| Database | Neon branch `production`, **pooled** connection, `sslmode=verify-full` |
| Env vars | `DATABASE_URL`, `AUTH_SECRET`, `ALLOWED_EMAILS`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — **Production only** (D22) |
| Google redirect URIs | `https://life-organiser-eight.vercel.app/api/auth/callback/google`, `http://localhost:3000/…`, `http://127.0.0.1:3000/…` |
| Build command | `package.json`'s `build` → `prisma generate && next build`; no Vercel override |
| **Production migration** | All three applied; `20261125061937_soft_delete_transactions` ran on 25 Nov through the **direct** string |
| Production rows | 1 household, 3 users, **0** accounts/transactions/budget periods/bills/categories |

Verified from outside with no session: `/`, `/dashboard` and `/transactions`
return 307 to `/login`; `/login` renders; `/api/auth/providers` reports exactly
the callback URI above. Changing any env var requires a redeploy before it takes
effect.

### 0.3 What is next

The import investigation changed the order. The CSVs work, but they carry no
unique transaction id and only weak transfer hints — and everything about FIN-8
depends on those two things.

1. **Compare export formats.** Ask Westpac for OFX/QIF and test a PDF statement.
   OFX would give `FITID` (unique id) and `TRNTYPE=XFER` (explicit transfer),
   removing both hard problems. Counts and reasoning:
   `docs/reference/csv-import-findings.md`.
2. **Decide the source and the transfer category.** Nullable `categoryId` is the
   recommendation (`(proposed)`). Then the two-tier ledger, before FIN-8.
3. **Then Week 4:** the accounts list with computed balances, the dashboard
   totals, a month selector, and transfer pairs.

Production still has no finance data, so the quick-add form shows the setup note
and edit/delete have only been exercised locally against `dev`.

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
- **Check whether it is already decided.** `00-status.md` lists D1–D29; if a row
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
| Database | ✅ Neon project, Sydney. `production` and `dev`; both migrated |
| Google OAuth client | ✅ Created 19 Nov, Publishing status Testing |
| **Auth.js** | ✅ `next-auth@5.0.0-beta.32`, pinned exactly |
| Allowlist | ✅ Enforced server-side in `signIn`; 8 tests; both household accounts proven 24 Nov; a third address (the mentor) added 25 Nov (D29) |
| `Household` row | ✅ One per branch |
| `User` provisioning | ✅ Production has 3 users (the third is the mentor, D29) |
| App UI | ✅ Shell closed against XC-3 |
| Finance schema | ✅ `20261124002343_phase1_finances` on both branches; soft delete on `dev` only |
| Transactions list | ✅ `/transactions`, month filter, pagination, total, states |
| Quick-add form | ✅ Expense only; Zod + server action |
| Edit / delete / undo | ✅ Verified 25 Nov, committed and deployed |
| Categories | ✅ `/categories`, create/rename/archive/restore, deployed |
| Filters | ✅ Account, category, status, text, deployed |
| shadcn/ui | ✅ Dialog + Sonner toast, role-token mapped, deployed |
| Account structure | ✅ Six accounts recorded (brief); business is ordinary (D30) |
| Import source | 🔎 Real exports analysed; format comparison is the next action |
| Deployment | ✅ Live on the 25 Nov build (`8ba692e`); production schema up to date |
| GitHub remote | ✅ `github.com/AnthonyMara97/life-organiser` |
| `db:seed` | ⏸ Deferred until XC-4 (demo household) |
| Roadmap | ✅ 6 hours/week, 16 weeks; W4 is accounts, dashboard and transfers |

Commit history, newest first:

```
8ba692e docs: record the mentor's review access
032b5d4 docs: close Week 3 — soft delete, categories and filters
00e7bd8 feat(transactions): add edit, delete with undo, filters and categories
e7f0e8c docs: record ALLOWED_EMAILS as Config
a070413 docs: close Week 2 and start Week 3
9beca09 feat(transactions): add the quick-add expense form
```

Pushed through `8ba692e`; the deploy check and this docs close follow it.

---

## 3. Next actions, in order

1. **Compare export formats.** Ask Westpac whether it offers OFX/QIF downloads and
   test a PDF statement against the CSV. Put the result in
   `docs/reference/csv-import-findings.md`. Do not paste real exports into chat;
   use `.imports/`.
2. **Decide the import source** and the transfer category (nullable `categoryId`
   proposed), then the two-tier ledger before FIN-8.
3. **Week 4's build:** account list with computed balances, dashboard totals,
   month selector, transfer pairs.
4. **When Cassidy's exports are available**, re-export every account for the same
   window and repeat the matching analysis; tonight's match rate is a floor.
5. **Delete the dev fixture** after the first real data import, including the
   archived "Test sub" category and the `.imports/` bank files.
6. **`db:seed` only when the demo household exists** (XC-4).

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
| Migrations on `dev` | `20261119044104_init`, `20261124002343_phase1_finances`, `20261125061937_soft_delete_transactions` |
| Migrations on `production` | all three; `20261125061937_soft_delete_transactions` applied 25 Nov with the direct string |
| Production migration URL | the **direct** production string, never the pooled Vercel one |
| Household row | ✅ one per branch |
| User rows | ✅ 3 in production: Anthony, his wife, and his mentor for review (D29) |
| Finance rows | ✅ 0 in production; 26 fictional rows + 7 categories in `dev` |

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
3. **The push needs Anthony's passphrase once per WSL session.** The fixed socket
   is `/tmp/ssh-agent.sock`. Check `SSH_AUTH_SOCK=/tmp/ssh-agent.sock ssh-add -l`
   first. To unlock, launch a WSL window running:
   ```bash
   ssh-agent -a /tmp/ssh-agent.sock
   SSH_AUTH_SOCK=/tmp/ssh-agent.sock ssh-add ~/.ssh/id_ed25519
   read -p "Press Enter to close..."
   ```
   Anything that talks to the remote (`ls-remote`, `fetch`, `push`) needs the
   socket too, or it waits for a passphrase no agent can type.
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
    was blocked for Next dev resources on 24 Nov (cross-origin HMR).
15. **`pg` warns about `sslmode=require`** on every run; it currently behaves as
    `verify-full`. The local `dev` string still says `require`.
16. **Production migrations need the direct branch string.** The Vercel
    `DATABASE_URL` is pooled (`-pooler`) and `prisma migrate deploy` cannot run
    DDL through it. Put the direct string in `.env.production.local` (ignored),
    use a temporary config that loads **that** file, run
    `prisma migrate deploy --config tmp-prisma.production.config.ts`, then delete
    both.
17. **The `.env.production.local` line is just the connection string.** Anthony
    pasted the whole `DATABASE_URL=...` assignment after the key on 24 Nov, so
    the value started with `DATABASE_URL="…"`. Normalise before use; do not print
    the value.
18. **`ALLOWED_EMAILS` is Config, not Secret.** Secret values are write-only: the
    edit form showed empty and saving replaced the whole list, which locked both
    users out on 24 Nov. Keep it Config.
19. **Vitest needs the `@/` alias.** `vitest.config.mts` maps `@` to `./src`.
20. **After a schema change, run `pnpm prisma generate` before `pnpm typecheck`.**
    On 25 Nov `migrate dev` applied the SQL but the generated client still lacked
    `deletedAt`, and the type error looked like a code problem.
21. **Sonner's `offset` is ignored below 600px wide.** Set `mobileOffset` as well
    or the toast lands on the phone tab bar. Both are now 80px.
22. **The signed-in browser session is in Anthony's Chrome, via the browse
    extension** — not in the in-app browser, which has no Google session. Verify
    at 390px with `emulate` (390×844), then reset the viewport and navigate the
    lent tab back to the production dashboard.
23. **A schema change reaches production before the code that needs it.** `main`
    auto-deploys, so migrate the `production` branch with the direct string first;
    on 25 Nov that was done before the push. The same order applies to every
    future migration.
24. **The two Westpac exports are different files.** The app export is 5 columns
    (`Date, Description, Debit, Credit, Balance`), `dd Mon yyyy`, oldest first;
    the internet-banking export is 8 columns
    (`Bank Account, Date, Narrative, Debit Amount, Credit Amount, Balance,
    Categories, Serial`), `dd/mm/yyyy`, **newest first**, and its `Serial` is
    empty. Never hardcode columns or assume row order. Shapes and counts:
    `docs/reference/csv-import-findings.md`.
25. **Real bank exports never go in chat or git.** Use `.imports/` (ignored). Read
    structure and counts only; do not echo balances, account numbers or merchant
    names.

---

## 5. What was actually done

### 25 November — Wednesday

**Data model**

- `Transaction.deletedAt` (nullable timestamptz) and migration
  `20261125061937_soft_delete_transactions`, applied to `dev`.
- `liveTransactionWhere(householdId)` added to `src/server/transactions.ts` and
  used by the list, the count, the sum and the delete/undo statements.
- `updateTransaction`, `deleteTransaction` and `undoDeleteTransaction` server
  actions; `transactionInputSchema` adds the row id and the direction, and
  rejects a category whose kind does not match it.

**Transactions UI**

- `transaction-table.tsx`: optimistic delete and restore, the 10-second toast,
  actions under the description below `md` and in a column above it.
- `edit-transaction-dialog.tsx`: shadcn dialog, positive amount plus direction,
  values preserved on error, closes once on success.
- `page.tsx`: filter bar (account, category, status, text) as a plain GET form;
  filtered count, net, pagination and month links; "Manage categories" link.

**Categories**

- `src/server/categories.ts` (one grouped count query, live child counts),
  `src/actions/categories.ts` (create, rename, archive/restore, parent rules),
  `/categories` page with `loading.tsx` and `error.tsx`, create form and rename
  dialog.

**shadcn/ui**

- `components.json`, `src/lib/utils.ts`, `src/components/ui/dialog.tsx`,
  `src/components/ui/sonner.tsx`, `<Toaster />` in the app layout, semantic CSS
  aliases in `globals.css` (the accent collision is documented there).
- Dependencies: `@radix-ui/react-dialog`, `sonner`, `clsx`, `tailwind-merge`.

**Verification**

- `pnpm typecheck`, `pnpm lint`, `pnpm test` — **60 tests** pass; `pnpm build`
  passes with `/categories` and `/transactions` dynamic.
- 390px pass in the signed-in browser: delete → undo, edit → save → restore,
  text/category/status filters, month nav keeping filters, category create,
  archive, restore, rename, and the disabled-archive guard on a parent.
- The database showed the row with `deletedAt` set between delete and undo.
- Two layout bugs found and fixed (mobile actions off-screen; toast over the tab
  bar), then re-checked.

**Access**

- A third allowlisted address was added: Anthony's software-development mentor,
  who reviews the work (D29). The account is a normal `member`; production now
  has 3 `User` rows. Anthony confirmed full member access is intended.

**Deploy**

- `20261125061937_soft_delete_transactions` was applied to `production` with the
  **direct** string through a temporary config, verified with `migrate status`
  and `information_schema` (`deletedAt` present), then both temporary files were
  deleted. Production rows were unchanged: 1 household, 3 users, 0 finance rows.
- Pushed `e7f0e8c..8ba692e`. Vercel deployed; `/categories` answers 307 to
  `/login` while an unknown route still answers 404, which proves the new build
  is the one serving.
- Signed-in check on the deployed app: `/transactions` renders the filter bar and
  “Manage categories” with the setup note (no accounts yet); `/categories` renders
  “0 active · 0 archived”, both sections empty and the add form working. No
  console errors.

**Import investigation (after the deploy)**

- Four one-month Westpac exports were placed in `.imports/` and read locally —
  header, format and aggregate patterns only.
- Found: two export formats; `dd Mon yyyy` vs `dd/mm/yyyy`; oldest-first vs
  newest-first; separate Debit/Credit columns everywhere; `$`/`CR`/`DR` balance
  markers; `Serial` empty in all 48 data-export rows; balance reconciles 100% once
  order is accounted for.
- Transfer detection measured: keyword counts (personal 2, joint 10, groceries 4,
  rainy day **0**); only 1 of 10 joint `TFR` rows matched a counterpart; amount +
  date produced 11 candidates including 5 implausible groceries→personal ones and
  2 ambiguous amounts; joint narratives carry 34 distinct tokens, **none** shared
  with another file, because each export names the counterparty.
- Conclusion recorded in `docs/reference/csv-import-findings.md`: suggest and
  confirm, never auto-pair; store each account's own reference; allow one-sided
  transfers; exclude only balanced groups; mask account numbers; replace the
  fingerprint with a multiset difference; use the balance as a sanity check.
- The upload labelled `joint-spendings.csv` was a byte-identical duplicate of the
  personal export; the real joint data is the 8-column file. The windows did not
  line up (groceries stopped on 5 Nov), so every match figure is a floor.

**Not done, deliberately**

- No finance data was created in production to exercise edit/delete there;
  production stays at 0 finance rows until the first real import.
- The dev fixture now includes one archived "Test sub" category from the check.

---

## 6. What to read, in what order

| File | Why |
|---|---|
| `docs/00-status.md` | **The position**, settled decisions and open questions. Read first |
| `AGENTS.md` | Standing rules. Overrides general defaults |
| This file | The detail behind the status page |
| `docs/05-working-agreement.md` | How decisions are made and what "done" means |
| `docs/04-roadmap.md` | Week 4 is the next milestone; is the request current? |
| `docs/03-architecture.md` | D27/D28/D30 and the earlier decisions |
| `docs/reference/csv-import-findings.md` | What the real exports showed; read before touching FIN-8 |
| `docs/01-product-brief.md`, `docs/02-features.md` | Existing scope or new? |

`docs/06-learning-log.md` is frozen. Read it for history only.

---

## 7. The session's architectural concept

**A soft delete turns a destructive action into a state change.** The row never
leaves the table, so the undo is one column update that still works after a
reload — and the price is that every read must ask the same question. That is why
the filter lives in one helper (`liveTransactionWhere`) rather than in each
query: a forgotten `deletedAt: null` puts a deleted transaction back into a
total, silently. The delete toast makes the same point from the other end: the
ten seconds is the toast's lifetime, not a countdown in the browser, so nothing
about the data depends on the page staying open.
