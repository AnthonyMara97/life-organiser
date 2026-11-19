# 07 — Session Handover

> **Purpose:** the first file to read at the start of a new session. It records the
> state of the machine and the repo, what has been agreed, what has not, and the
> first actions to take. It is a working document, not a permanent record — rewrite
> it at the close of each session.
>
> **Last updated:** 19 November 2026, end of the evening session (first migration).
> **Next session:** Friday 20 November, evening — one hour. Starts at §0.1.
> Confirm the repo state with `git status -sb` before anything else.

---

## 0. Start here

### 0.1 Friday: two decisions before any auth code

Both are blocking. Neither has been agreed, so neither is in the repo.

**Decision A — the Auth.js dependency.** `next-auth` is the first dependency since
Prisma, and it is still published as a **beta** on the v5 line.

- **v5 beta, pinned to an exact version** (recommended). It is what Next.js 16 and
  React 19 are built against; the v4 line does not support the App Router. Pin it
  so a beta release cannot change behaviour under us.
- v4. Rejected on compatibility: the App Router integration is the thing v5 exists
  to provide.
- Hand-rolled sessions with signed cookies. More code to own, and the sign-in
  redirect flow with Google is fiddly to get right; not worth it for two users.

Cost to reverse: a version bump, or a swap to another library — the session cookie
format is the only thing that changes, and there is no production data yet.
What could go wrong: a beta breaking change mid-week. Mitigation is the pin.

**Decision B — how a signed-in person becomes a `User` row.** The architecture
specifies JWT sessions and a `User` row created on first sign-in, with no Prisma
adapter and therefore no `Account` / `Session` tables.

- **JWT + `User` row on first sign-in** (recommended). Two tables instead of four,
  and nothing about our data is in Google's shape.
- Prisma adapter (conventional). Adds `Account` and `Session` tables and a
  dependency; useful for refresh tokens we do not need for sign-in only.

Cost to reverse: adding the adapter later is a migration plus backfilling
`Account` rows on next sign-in. Cheap while there are two users.

**A sub-question that follows: which household does the first user join?** `User`
has a non-null `householdId`, and v1 has exactly one `Household` row. Nothing
creates it yet. Options: the seed script creates the household (and the app
assumes it exists); or the first sign-in creates one if none exists. This is a
data-model decision — ask, do not choose. It must be settled before the code that
provisions users is written.

### 0.2 Still open, and needed before Week 2

**The budget period model** — fortnightly, monthly, or two-tier. Blocks the period
functions. `BudgetPeriod` stays marked `(proposed)` in `docs/03-architecture.md`
until Anthony confirms.

**Two-tier ledger** (`needs_review` vs `confirmed`) and **savings-goal-as-P0** —
also unconfirmed from earlier sessions.

---

## 1. What changed on 18 November: the working mode

**This is the most important section for a new agent.**

- The project is now a **shipping project**. It builds a real household app, and
  it teaches **software architecture** — how the pieces fit and why.
- **It no longer teaches coding.** No syntax lessons, no walkthroughs, no
  read-backs. Anthony learns fundamentals on his own time and asked specifically
  that this repo not be a tutorial.
- **One architectural concept per session**, two or three sentences, tied to the
  code in front of him. Explanations on request.
- **He reviews every commit first.** Overview in chat, wait, then commit.
- The `dates.ts` read-back gate is dead. Do not re-open it, and do not re-explain
  `dates.ts`.

`AGENTS.md` holds the full wording. `docs/06-learning-log.md` is frozen.

---

## 2. Where things stand

| | Status |
|---|---|
| Planning documents | ✅ Written, reviewed, committed |
| Machine setup | ✅ WSL Ubuntu + nvm + Node 26 + pnpm |
| Next.js scaffold | ✅ Builds, typechecks, lints, 15 tests |
| `src/lib/dates.ts` | ✅ Written, tested. **Do not re-teach it** |
| Prisma | ✅ 7.10.1, client generated, CLI loads `.env.local` |
| Database | ✅ Neon dev project, Sydney. Migration applied |
| Google OAuth client | ✅ Created 19 Nov, Publishing status Testing |
| Auth.js itself | ❌ Not installed, not started |
| App UI | ❌ Still "Hello world!" |
| Deployment | ❌ Not started |
| GitHub remote | ✅ `github.com/AnthonyMara97/life-organiser` |
| Roadmap | ✅ 6 hours/week, 16 weeks |

Commit history, oldest last:

```
cd5f0f0 feat(db): apply the initial migration to Neon   ← pushed
753cbfb docs: close the OAuth morning session and point at the database decision
3c6c403 docs(auth): record the OAuth client runbook and env names
3517a31 docs: record the OAuth session, the WSL workaround and the Prisma state
915dfe5 chore(deps): approve Prisma build scripts and generate the client
9befe16 docs: switch to shipping mode and re-plan at six hours a week
ac066fd feat(db): add Prisma schema for Household and User
7c28b32 docs: close session 4 with the read-back still open
6d970ca feat(dates): add calendar-day helpers with tests
5642bbe chore: scaffold Next.js application
```

---

## 3. This week's plan — Thursday 19 to Sunday 22 November

Two hours remain this week (Friday 1h, Saturday 30m, Sunday 30m).

| When | Hour | Goal |
|---|---|---|
| ~~Thu 19~~ | ~~1h~~ | ✅ Database decision, Neon created, first migration applied |
| **Fri 20** | 1h | Auth.js with Google and the `ALLOWED_EMAILS` allowlist. Concept: **the server decides who is allowed in; the client only asks** |
| **Sat 21** | 30m | App shell and a sign-in page that renders on a 390px phone |
| **Sun 22** | 30m | Deploy to Vercel, sign in from a phone |

**Anthony's own task:** his wife's Google Account, created from her Outlook
address, then that address added **both** as a Google test user and to
`ALLOWED_EMAILS`. The two lists are separate on purpose. Not blocking Friday's
build — only the two-person acceptance test.

**At risk:** Week 1's acceptance test may land on Monday rather than Sunday.
Acceptable at this pace. Do not compress two weeks into one to catch up.

---

## 4. Next actions, in order

1. **Friday, first:** put Decision A and Decision B to Anthony (§0.1). Nothing
   installed or written before he answers.
2. Install `next-auth` at the pinned version. The environment variable names in
   `.env.example` are already v5-shaped and marked `(proposed)` — remove the
   markers in the same commit.
3. The `signIn` callback, the allowlist and the sign-in page.
4. Settle the household bootstrap (§0.1), then the provisioning code.
5. App shell; deploy; add the **production** redirect URI to the OAuth client at
   that point, and the pooled Neon connection string as a Vercel env var.
6. When the budget period model is settled, write the period functions with tests.
7. When a demo household exists, add `db:seed` to `package.json` — deliberately
   absent now, because a script pointing at a file that does not exist is worse
   than no script.

---

## 5. The machine, as it actually is

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
| Docker / `psql` / `neonctl` | ❌ Not installed |
| SSH key | `~/.ssh/id_ed25519`, **passphrase-protected** |
| Remote | `git@github.com:AnthonyMara97/life-organiser.git` (public) |

### The database

| Thing | Value |
|---|---|
| Provider | Neon, free tier, project `life-organiser` |
| Region | AWS `ap-southeast-2` (Sydney) |
| Database / role | `neondb` / `neondb_owner` |
| Connection used | **Direct** (host has no `-pooler`), `sslmode=require` |
| Where it lives | `DATABASE_URL` in `.env.local`, mode 600, never committed |
| Migration | `prisma/migrations/20261119044104_init` — applied and verified |

Pooling is deliberately **off** in the dev URL: `prisma migrate` cannot run
through a pooled connection. At deploy time the app takes the pooled string as a
Vercel environment variable; serverless functions open too many short-lived
connections without it.

### Behaviours that waste time if forgotten

1. **`node` only exists in an interactive shell.** Use
   `wsl -d Ubuntu -- bash -ic '...'`, not `bash -lc`.
2. **PowerShell eats `$?` and inner quotes.** Write a short `.sh` to
   `/mnt/c/Users/amara/AppData/Local/Temp/opencode/` and run it with
   `wsl -d Ubuntu --cd /home/anthony/repos/life-organiser -- bash /mnt/c/.../x.sh`.
   Scripts should `[ -f package.json ]` rather than `cd` (§6, item 7 below).
3. **No SSH agent runs by default**, so `git push` fails with
   `Permission denied (publickey)`. Start one and add the key:
   `ssh-agent -a /tmp/ssh-agent.sock`, then
   `SSH_AUTH_SOCK=/tmp/ssh-agent.sock ssh-add ~/.ssh/id_ed25519` (passphrase
   prompt, must be typed by Anthony). **`ssh-add` succeeding is not enough** —
   the push must also see the socket: `export SSH_AUTH_SOCK=/tmp/ssh-agent.sock`.
   That was the stumble on 19 Nov. The agent dies with the WSL instance.
4. **`pnpm build` writes to stderr on success**, and **`pnpm add` prints a red
   `ERR_PNPM_IGNORED_BUILDS` even when the package installs.** Read the exit path,
   not the colour.
5. **GitHub rejects commits exposing a private email (GH007).** Check
   `git log -1 --format=%ae` before blaming the key.
6. **pnpm blocks install scripts** (`allowBuilds` in `pnpm-workspace.yaml`).
   `prisma`, `@prisma/engines` and `esbuild` are approved. A new package needing a
   postinstall stops the install — that is a security decision, so ask first.
7. **`cd` inside a script run as `bash /tmp/x.sh` fails** with ENOENT. Use
   `--cd` on the `wsl` command and guard with `[ -f package.json ]`.
8. **Non-interactive shells have no `node`.** Source nvm in the script:
   `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"`.
9. **Prisma prints a Node support warning on Node 26** during install. It
   proceeds; if a Prisma command misbehaves, that mismatch is the first suspect.
10. **PowerShell 5.1 rejects `&&`** and expands `$` in double-quoted arguments.
    One command per call, or the script-file workaround above.
11. **Prisma's `env()` treats an empty string as missing**, so a blank
    `DATABASE_URL=""` fails with `PrismaConfigEnvError`. That is correct behaviour,
    not a broken loader: `prisma.config.ts` reads `.env.local` through Node's
    built-in `process.loadEnvFile`, guarded by `existsSync`.
12. **`.env.local` is the only place the connection string lives.** Do not print
    it, do not paste it into chat, do not copy it into a command line.

---

## 6. What was actually done

### 19 November — evening (first migration)

- Anthony chose **Neon** over Docker: production is Neon either way, so Docker
  would mean two database setups and meeting the differences at deploy time.
  Docker gets its own session later if he wants the container experience.
- Neon project `life-organiser` created in `ap-southeast-2` (Sydney), on the free
  tier. The **direct** (non-pooled) connection string went into `.env.local` by
  Anthony's hand; it was never printed to chat or committed.
- **`prisma.config.ts`** now calls `process.loadEnvFile(".env.local")` when the
  file exists. No new dependency — the `dotenv` alternative would add a package
  for identical behaviour.
- **`pnpm exec prisma migrate dev --name init`** produced
  `prisma/migrations/20261119044104_init/migration.sql` and applied it. The SQL
  creates the `Role` enum, `Household`, `User`, the unique email index, the
  `householdId` index and the foreign key.
- **Verified independently:** `prisma migrate status` reports up to date, and
  `prisma db pull --print` reads the live database back into a schema that matches
  `prisma/schema.prisma`. The tables are real, not just written down.
- **`package.json`** gained `db:migrate` and `db:studio`. `db:seed` waits for a
  seed file.
- `pnpm typecheck`, `pnpm lint` and `pnpm test` (15 tests) all pass.
- Committed as `cd5f0f0` and pushed.

### 19 November — morning (OAuth client)

Condensed; the full sequence is `docs/reference/oauth-setup.md`.

Google Cloud project `life-organiser`; app **Life Organiser**, External audience,
publishing status **Testing**, one test user, no scopes added, AI-agent checkbox
unticked. Client `Life Organiser web`, redirect URI
`http://localhost:3000/api/auth/callback/google`. Client ID, secret and a
generated `AUTH_SECRET` are in `.env.local`. No `next-auth` installed, no auth
code, no production redirect URI yet.

### 18 November

- **Prisma 7.10.1** pinned (registry `latest` is an 8.0 release candidate).
- `prisma/schema.prisma`: `Household`, `User`, `Role`; timestamps are
  `@db.Timestamptz(3)` so moments in time carry a timezone.
- `prisma.config.ts` created because Prisma 7 removed `url` from the schema
  block: the CLI reads the URL from the config, the app will use a driver adapter.
- `.gitignore` fixed so `.env.example` is committable while `.env.local` is not.
- Prisma build scripts approved in `pnpm-workspace.yaml` with date and reason.

---

## 7. What to read, in what order

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

## 8. The session's architectural concept

**Evening, 19 Nov:** *the schema is the source of truth, and a migration is
versioned SQL you commit.* Nobody edits the live database; they edit
`schema.prisma`, and Prisma translates the difference into SQL that lives in git
forever. In Prisma 7 the *shape* of the data sits in the schema while the
*connection* sits in `prisma.config.ts` — same database, two consumers, one
definition.

**Morning, 19 Nov:** *configuration is an input to the system, not part of it.*
The OAuth client, its secret and the allowlist live outside the code; the code
reads names at start-up.
