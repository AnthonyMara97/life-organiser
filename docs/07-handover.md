# 07 — Session Handover

> **Purpose:** the first file to read at the start of a new session. It records the
> state of the machine and the repo, what has been agreed, what has not, and the
> first actions to take. It is a working document, not a permanent record — rewrite
> it at the close of each session.
>
> **Last updated:** 18 November 2026, end of session 5 (second pass).
> **Next session:** Thursday 19 November — a morning session on the Google Cloud
> OAuth client, then the usual one-hour session in the evening. Starts at §0.
> Confirm the repo state with `git status -sb` before anything else.

---

## 0. Start here

### 0.1 Thursday morning — Google Cloud OAuth client (Anthony's request)

He asked for a walkthrough of creating the OAuth client. **Walk him through it**:
Cloud project, OAuth consent screen, credentials, redirect URIs for localhost and
Vercel, then where each value goes in `.env.local`.

This is operational, not a coding lesson — it fits the current brief. Have him
drive; do not create the credentials for him. Screenshot each step into the repo
**only if the screenshots contain no account identifiers**.

### 0.2 Thursday evening — one decision blocks everything

**The database has nowhere to run.** Do not write code before this is settled: it
blocks the first migration, the Prisma client, Auth.js and the deploy.

Put the choice to Anthony in exactly these terms, then stop and wait.

| | Neon dev branch | Docker Postgres |
|---|---|---|
| What it is | Hosted Postgres, free tier | Postgres in a container on his laptop |
| Time to first query | ~5 minutes | 20–40 minutes, possible WSL restart |
| Production parity | Same provider as production (architecture §11) | A second setup to maintain |
| Offline | Needs internet; sleeps when idle | Works offline |
| Learning value | Branching, pooling | Containers, volumes, ports |
| Cost to reverse | Change `DATABASE_URL`, re-seed | `pg_dump` and restore once real data exists |

**Recommendation to give him: Neon.** Production is Neon either way, so Docker
means running two different database setups and meeting the differences on the
deployed app. Docker is worth a deliberate session of its own — not tonight's
only hour.

Once he answers, the order is: create the database → put the connection string in
`.env.local` (never in chat) → `pnpm exec prisma migrate dev --name init`.

**Before that migration runs, one small thing must be fixed.** Prisma 7 does not
load `.env.local` by itself, and `prisma.config.ts` calls `env("DATABASE_URL")`
eagerly, so the CLI will fail with `PrismaConfigEnvError` the moment `.env.local`
exists but isn't loaded. Recommended fix, no new dependency: call Node's built-in
`process.loadEnvFile(".env.local")` at the top of `prisma.config.ts`, guarded by
`existsSync` so a machine without the file still behaves. Mention the alternative
(the `dotenv` package) but recommend the built-in — it is one less dependency for
identical behaviour.

---

## 1. What changed on 18 November: the working mode

**This is the most important section for a new agent.** The project's purpose has
been narrowed, by Anthony, and the standing rules were rewritten to match.

- The project is now a **shipping project**. It builds a real household app, and
  it teaches **software architecture** — how the pieces fit and why.
- **It no longer teaches coding.** No syntax lessons, no walkthroughs, no
  read-backs, no "explain it back". He learns fundamentals on his own time and
  asked specifically that this repo not be used as a tutorial.
- **One architectural concept per session**, two or three sentences, tied to the
  code in front of him. Explanations on request. That is the only teaching.
- **He reviews every commit first.** Show the overview in chat, wait, then commit.
  Budget up to 20 minutes on top of the session.
- **The `dates.ts` read-back gate is dead.** It was created to prove comprehension
  and is withdrawn along with the teaching brief. Both failed attempts (17 and 18
  Nov) are recorded in the frozen learning log; nothing further is owed. Do not
  re-open it, and do not re-explain `dates.ts`.
- The 17 Nov learning brief is withdrawn. Full wording of the new brief is in
  `AGENTS.md` → "What the owner is optimising for (revised 18 Nov 2026)".

`AGENTS.md`, `docs/05-working-agreement.md` and `docs/04-roadmap.md` were updated
in the same commit so that no document contradicts this one.

---

## 2. Where things stand

| | Status |
|---|---|
| Planning documents | ✅ Written, reviewed, committed |
| Machine setup | ✅ WSL Ubuntu + nvm + Node 26 + pnpm |
| Next.js scaffold | ✅ Builds, typechecks, lints |
| `src/lib/dates.ts` | ✅ Written, 15 tests passing. **Do not re-teach it** |
| Prisma | ✅ Installed, configured, client generated. **No migration yet** |
| Database | ❌ Not chosen, not created |
| Auth | ❌ Not started |
| App UI | ❌ Still "Hello world!" |
| Deployment | ❌ Not started |
| GitHub remote | ✅ Public, `github.com/AnthonyMara97/life-organiser` |
| Roadmap | ✅ Re-planned 18 Nov: 6 hours/week, 16 weeks |

Commit history, oldest last:

```
docs: record the OAuth session, the WSL workaround and the Prisma state  ← this commit
chore(deps): approve Prisma build scripts and generate the client
9befe16 docs: switch to shipping mode and re-plan at six hours a week
ac066fd feat(db): add Prisma schema for Household and User
7c28b32 docs: close session 4 with the read-back still open
85aacc3 docs(learning): record the dates walkthrough and the open read-back
19eb45d docs(agents): record the owner's learning brief
acf2d33 docs: make the date read-back the first action next session
d4e58b7 docs: record the first push and the email privacy fix
ba47563 docs: record session 3 decisions and close the handover
6d970ca feat(dates): add calendar-day helpers with tests
0266bc5 chore(test): add Vitest and test scripts
c374304 docs(scope): replace Google Drive import with in-app CSV upload
c755208 chore(next): disable component caching while learning
0b5c904 chore(deps): bump @types/node to match the Node 26 runtime
6f90e98 docs: add session handover and record today's setup work
5642bbe chore: scaffold Next.js application
bedbf8e docs: add initial project documentation
```

---

## 3. This week's plan — Thursday 19 to Sunday 22 November

Six hours a week: one hour on each weeknight, thirty minutes on each weekend day.
Tonight (Wednesday) is spent. Three hours remain this week.

| When | Hour | Goal |
|---|---|---|
| **Thu 19** | 1h | Database decision, then the first migration. Concept: **the schema is the source of truth, and a migration is versioned SQL that you commit** |
| **Fri 20** | 1h | Auth.js with Google and the `ALLOWED_EMAILS` allowlist. Concept: **the server decides who is allowed in; the client only asks** |
| **Sat 21** | 30m | App shell and a sign-in page that renders on a 390px phone |
| **Sun 22** | 30m | Deploy to Vercel, sign in from a phone |

**Anthony's own task before Friday:** create the Google Cloud OAuth client
(project, consent screen, redirect URIs). It is his to create — an agent cannot.
Allow 15 minutes of clicking, and screenshot each step so it is repeatable.

**At risk:** Week 1's acceptance test — signing in from a phone on the deployed
URL — may land on Monday rather than Sunday at 3 hours. That is acceptable at this
new pace. Do not compress two weeks into one to catch up.

---

## 4. Decisions still open — ask before coding

1. **The database** (§0). Blocks Thursday entirely.
2. **Budget period model.** Fortnightly, monthly, or two-tier. Blocks the period
   functions and Week 2. `BudgetPeriod` is still marked `(proposed)` in
   `docs/03-architecture.md` and must stay that way.
3. **Sign-in user provisioning.** Auth.js normally ships a Prisma adapter with
   `Account` and `Session` tables. The architecture specifies JWT sessions and a
   `User` row created on first sign-in, which needs no adapter. Confirm the
   approach before implementing — it is a data-model decision, not execution
   detail.
4. **Two-tier ledger** (`needs_review` vs `confirmed`) and **savings-goal-as-P0** —
   still unconfirmed from earlier sessions.

---

## 5. Next actions, in order

1. **Thursday morning:** the OAuth client walkthrough (§0.1).
2. **Thursday evening:** put the database decision to Anthony (§0.2), create the
   database, fix env loading in `prisma.config.ts`, run the first migration, and
   confirm the two tables exist.
3. Add `db:migrate`, `db:studio`, `db:seed` scripts to `package.json`.
4. Auth.js, app shell, deploy.
5. When the budget period model is settled, write the period functions with tests.
   Not before.

---

## 6. The machine, as it actually is

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
| Docker / `psql` / `neonctl` | ❌ Not installed (checked 17 Nov) |
| SSH key | `~/.ssh/id_ed25519`, **passphrase-protected** |
| Remote | `git@github.com:AnthonyMara97/life-organiser.git` (public) |

Windows has no Node, pnpm or git. Do not run project commands from PowerShell.

### Behaviours that waste time if forgotten

1. **`node` only exists in an interactive shell.** Use
   `wsl -d Ubuntu -- bash -ic '...'` (`-i`), never `bash -lc` (`-l`).
2. **PowerShell eats `$?` and inner double quotes.** Long commands lose their
   quoting; write a short `.sh` into `/tmp` and run `wsl -d Ubuntu -- bash /tmp/x.sh`.
3. **No SSH agent was running at the close of session 5**, so the push was left to
   Anthony. To create one:
   `ssh-agent -a /tmp/ssh-agent.sock`, then
   `SSH_AUTH_SOCK=/tmp/ssh-agent.sock ssh-add ~/.ssh/id_ed25519` (passphrase
   prompt). The agent dies with the WSL instance.
4. **`pnpm build` writes to stderr on success**, and **`pnpm add` prints a red
   `ERR_PNPM_IGNORED_BUILDS` even when the package installs.** Read the exit path,
   not the colour.
5. **GitHub rejects commits that expose a private email (GH007).** Check
   `git log -1 --format=%ae` before blaming the key. Never make the Gmail public.
6. **pnpm blocks install scripts** (`allowBuilds` in `pnpm-workspace.yaml`).
   Prisma's `prisma`, `@prisma/engines` and `esbuild` are now approved (18 Nov), so
   installs are clean. Any new package that needs a postinstall will stop the
   install with `ERR_PNPM_IGNORED_BUILDS` — that is a security decision, so ask
   Anthony before adding it to `allowBuilds`.
7. **`cd` into the project fails inside a script.** Discovered 18 Nov: a script
   run as `wsl -d Ubuntu -- bash /tmp/x.sh` cannot `cd
   /home/anthony/repos/life-organiser` — it returns ENOENT, while `ls` on the same
   path succeeds and `cd` works when typed inline. Cause not established; WSL
   oddity, not a permissions problem. **Workaround:** start the command with
   `wsl -d Ubuntu --cd /home/anthony/repos/life-organiser -- bash /tmp/x.sh` and
   have the script guard with `[ -f package.json ]` instead of `cd`.
8. **Non-interactive shells have no `node`** even with `-i` inconsistencies above.
   Source nvm inside the script — `export NVM_DIR="$HOME/.nvm";
   . "$NVM_DIR/nvm.sh"` — rather than depending on the caller.
9. **Prisma prints a Node support warning on Node 26** ("supports 20.19+, 22.12+,
   24.0+") during install. It proceeds and the client generates correctly. If a
   Prisma command misbehaves, that mismatch is the first suspect.

---

## 7. What was actually done on 18 November

Lean on this rather than re-deriving it.

- **Prisma 7.10.1 installed** as a dev dependency. Deliberate: the registry's
  `latest` tag currently points at `8.0.0-rc.34`, a release candidate. Stable is
  pinned. Reversing is a version bump plus deleting `prisma.config.ts`.
- **`prisma/schema.prisma`** — `Household` and `User`, exactly as
  `docs/03-architecture.md` §3 specifies, plus the `Role` enum
  (`member` | `demo`). Locale-dependent timestamps use `@db.Timestamptz(3)`,
  because Prisma's default `TIMESTAMP(3)` has no timezone and the architecture
  requires moments in time to be timestamptz.
- **`prisma.config.ts`** — Prisma 7 removed `url` from the schema. The CLI takes
  the URL from this file; the app will take a driver adapter instead.
- **`.env.example`** created, and `.gitignore` fixed: the blanket `.env*` rule was
  also excluding `.env.example`, which must be committed.
- **Verified:** `prisma validate` passes, and
  `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`
  produces the exact SQL the first migration will contain. `pnpm typecheck`,
  `pnpm lint` and `pnpm test` (15 tests) all pass.
- **Second pass, same night:** Anthony approved the three install scripts
  (`prisma`, `@prisma/engines`, `esbuild`) and they are recorded in
  `pnpm-workspace.yaml` with the date and the reason. `@prisma/client@7.10.1` was
  installed as a runtime dependency, and `prisma generate` now succeeds in ~40ms.
- **Not done, deliberately:** no database, no migration, no `.env.local`. The
  client is generated from the schema, but nothing is connected and nothing has
  been written to a database.

---

## 8. The scaffold, recorded honestly

`create-next-app` produced 11 files. The template `README.md` and `AGENTS.md` were
replaced; Next.js's guidance for coding agents is preserved at
`docs/reference/nextjs-agent-notes.md`.

Still unreviewed, and owed an explanation as an **architectural** note — not a
lesson: `target: "ES2017"` and `allowJs: true` in `tsconfig.json`, and
`sharp: false` / `unrs-resolver: false` in `pnpm-workspace.yaml` (install scripts
blocked — a security default).

The hand-rebuild exercise in `~/repos/scratch-next` is **cancelled** under the new
brief. It was a learning task.

---

## 9. What to read, in what order

| File | Why |
|---|---|
| `AGENTS.md` | Standing rules. Overrides general defaults |
| This file | Current state and next actions |
| `docs/05-working-agreement.md` | How decisions are made and what "done" means |
| `docs/04-roadmap.md` | Is the request the current milestone? |
| `docs/03-architecture.md` | Is there a recorded decision this contradicts? |
| `docs/01-product-brief.md`, `docs/02-features.md` | Is this existing scope or new? |

`docs/06-learning-log.md` is frozen. Read it for history only.

---

## 10. The session's architectural concept

Session 5's concept: **the schema is the source of truth, and the migration it
generates is versioned SQL you commit** — Prisma only translates one into the
other, and in Prisma 7 the *shape* of the data lives in the schema while the
*connection* lives in `prisma.config.ts`.

Session 6 should name its own, in one or two sentences, in §10 of its rewrite.
