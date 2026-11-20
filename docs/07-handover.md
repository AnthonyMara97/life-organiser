# 07 — Session Handover

**Last updated:** 20 November 2026, end of the Friday auth session.
**Next session:** Saturday 21 November, 30 minutes. Start at §0.1.
Run `git status -sb` before anything else.

---

## 0. Start here

### 0.1 Saturday: insert the household row, then provision the user

Two pieces of work, in this order. The first is Anthony's hand, the second is
code.

**Step 1 — the `Household` row (no code, ~5 minutes, guided).** Anthony decided
on 20 Nov that the single v1 household is **inserted by hand once**, not seeded
and not created on first sign-in. He asked to do it on Saturday with the agent
guiding. He has not chosen the name — it is user-visible data, so ask him for it
rather than inventing one.

He runs this in the Neon console's SQL editor for the `life-organiser` project
(database `neondb`), replacing the name:

```sql
insert into "Household" (id, name, "createdAt")
values ('household_v1', 'The <surname> household', now());
```

Notes for the guide:

- `id` is a plain `String` primary key, so a readable literal is valid; the
  `cuid(2)` default only applies when Prisma creates the row. It must never be
  changed once `User` rows point at it.
- Verify with `select id, name from "Household";` — exactly one row.
- Do **not** paste the connection string or any real household detail into chat.

**Step 2 — the adapter decision, then provisioning.** The `User` row on first
sign-in needs the database at runtime, and Prisma 7 has no built-in connection:
it needs a driver adapter. Anthony deferred this on 20 Nov by choosing "no
database tonight", so **the adapter is still unchosen** — it is not a decision
that was made and parked, it is a decision still to put to him.

Options, as presented on 20 Nov:

- **`@prisma/adapter-pg@7.10.1` + `pg`** (recommended). Works with the direct
  connection string already in `.env.local`; ordinary Postgres semantics, so dev
  and production behave the same.
- `@prisma/adapter-neon@7.10.1`. Serverless-friendly on Vercel, but expects the
  `-pooler` host, which dev deliberately does not use, and its connection
  semantics differ.
- Defer again. Cheap, but Week 1's acceptance test then slips further.

Cost to reverse: one import and one constructor line, plus switching the URL to
the pooled host. Nothing else depends on the choice.

**Then the code, once he has chosen:** a Prisma singleton at `src/lib/db.ts`
built on the chosen adapter; in the `signIn` callback, after the allowlist
passes, find the one household and upsert the `User` by email; put `userId` and
`householdId` on the JWT in the `jwt` callback and expose them in `session`.
**Fail closed:** if provisioning throws, the sign-in must fail rather than mint
a session with no household.

**Schedule, honestly:** Saturday is 30 minutes and now carries the household
row, the adapter decision, provisioning and tests. The shell (390px sign-in
page, sidebar/tabs) and the deploy are still ahead, in a 30-minute Sunday. That
is more than the remaining hour. Week 1's acceptance test — signing in from a
phone on the deployed URL — will most likely land on Monday. Do not compress two
weeks to catch up.

### 0.2 Still open, and needed before Week 2

**The budget period model** — fortnightly, monthly, or two-tier. Blocks the
period functions. `BudgetPeriod` stays marked `(proposed)` in
`docs/03-architecture.md` until Anthony confirms.

**Two-tier ledger** (`needs_review` vs `confirmed`) and **savings-goal-as-P0** —
also unconfirmed from earlier sessions.

**Anthony's own task:** his wife's Google Account, created from her Outlook
address, then that address added **both** as a Google test user and to
`ALLOWED_EMAILS`. As of 20 Nov, `ALLOWED_EMAILS` holds **one** address —
Anthony's. The two lists are separate on purpose. Not blocking the build; it
blocks the two-person acceptance test.

---

## 1. What changed on 18 November: the working mode

**This is the most important section for a new agent.**

- The project is now a **shipping project**. It builds a real household app, and
  it teaches **software architecture** — how the pieces fit and why.
- **It no longer teaches coding.** No syntax lessons, no walkthroughs, no
  read-backs. Anthony learns fundamentals on his own time and asked specifically
  that this repo not be a tutorial.
- **One architectural concept per session**, two or three sentences, tied to the
  code in front of him.
- **Decisions belong to him** (§AGENTS.md). Present the decision, two or three
  options, a recommendation with what could go wrong, and the cost to reverse.
  Then stop. He approved every dependency added so far.

---

## 2. Where things stand

| Thing | State |
|---|---|
| Planning docs | ✅ Committed |
| Machine setup | ✅ WSL Ubuntu + nvm + Node 26 + pnpm |
| Next.js scaffold | ✅ Builds, typechecks, lints |
| `src/lib/dates.ts` | ✅ Written, tested. **Do not re-teach it** |
| Prisma | ✅ 7.10.1, client generated, CLI loads `.env.local` |
| Database | ✅ Neon dev project, Sydney. Migration applied |
| Google OAuth client | ✅ Created 19 Nov, Publishing status Testing |
| **Auth.js** | ✅ **Installed and working** — `next-auth@5.0.0-beta.32`, pinned exactly |
| Allowlist | ✅ Enforced server-side in `signIn`; 8 tests |
| Sign-in page | ✅ `/login` renders and redirects to Google |
| `User` provisioning | ❌ Not written — needs the adapter (§0.1) |
| `Household` row | ❌ Not in the database — inserted by hand Saturday (§0.1) |
| App UI | ❌ Placeholder page showing the session; no shell |
| Deployment | ❌ Not started |
| GitHub remote | ✅ `github.com/AnthonyMara97/life-organiser` |
| Roadmap | ✅ 6 hours/week, 16 weeks |

Commit history, oldest last:

```
228065c feat(auth): add Google sign-in with a server-side allowlist   ← pushed 20 Nov
bbfd716 docs: close the migration session and open the auth decisions
cd5f0f0 feat(db): apply the initial migration to Neon
753cbfb docs: close the OAuth morning session and point at the database decision
3c6c403 docs(auth): record the OAuth client runbook and env names
3517a31 docs: record the OAuth session, the WSL workaround and the Prisma state
915dfe5 chore(deps): approve Prisma build scripts and generate the client
9befe16 docs: switch to shipping mode and re-plan at six hours a week
ac066fd feat(db): add Prisma schema for Household and User
```

The commits after `228065c` close this session (this file).

---

## 3. This week's plan — Thursday 19 to Sunday 22 November

| When | Hour | Goal |
|---|---|---|
| ~~Thu 19~~ | ~~1h~~ | ✅ Database decision, Neon created, first migration applied |
| ~~Fri 20~~ | ~~1h~~ | ✅ Auth.js with Google, the `ALLOWED_EMAILS` allowlist, sign-in page |
| **Sat 21** | 30m | Household row by hand, adapter decision, `User` provisioning |
| **Sun 22** | 30m | App shell at 390px, then deploy to Vercel and sign in from a phone |

Two goals were planned for this weekend and there are now three; the acceptance
test likely lands Monday. Acceptable at this pace.

---

## 4. Next actions, in order

1. **Saturday, first:** guide Anthony through the household `INSERT` in the Neon
   SQL editor (§0.1). Verify one row exists.
2. **Put the adapter decision to him** (§0.1). Nothing installed before he
   answers.
3. Install the chosen adapter, add `src/lib/db.ts` (Prisma singleton with the
   adapter), and implement provisioning in `signIn` + `jwt` + `session`. Fail
   closed on a database error.
4. Test both paths: his account creates exactly one `User` row with the
   household; a non-allowlisted address is rejected with no row written.
5. App shell: sidebar on desktop, bottom tabs on phone, placeholder dashboard,
   sign-in page at 390px.
6. Deploy to Vercel: production redirect URI added to the OAuth client, **pooled**
   Neon string as a Vercel env var, `AUTH_SECRET`, `ALLOWED_EMAILS`,
   `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
7. Add `db:seed` only when a demo household exists — deliberately absent now.
8. When the budget period model is settled, write the period functions with
   tests.

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
| Docker / `psql` / `neonctl` | ❌ Not installed — the SQL editor is the way in |
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
| Household row | ❌ Does not exist yet — Saturday's first task |

Pooling is deliberately **off** in the dev URL: `prisma migrate` cannot run
through a pooled connection. At deploy time the app takes the pooled string as a
Vercel environment variable.

### Behaviours that waste time if forgotten

1. **`node` only exists in an interactive shell.** Use
   `wsl -d Ubuntu -- bash -ic '...'`, not `bash -lc`. Verify with `node -v`
   before blaming a script.
2. **PowerShell eats `$?`, `|` inside quotes, and `<`/`>` in arguments.** Write a
   short `.sh` to `/mnt/c/Users/amara/AppData/Local/Temp/opencode/` and run it
   with `wsl -d Ubuntu --cd /home/anthony/repos/life-organiser -- bash
   /mnt/c/.../x.sh`. Scripts should `[ -f package.json ]` rather than `cd`.
3. **The push cannot be done by an agent.** No SSH agent runs by default and the
   key is passphrase-protected, so `git push` waits forever for a prompt nobody
   can type. On 20 Nov the agent committed and could not push; Anthony pushed by
   typing the passphrase in a terminal window. Expect the same next session:
   prepare the commits, then hand him the window. He must run, in his own WSL
   terminal:
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519          # passphrase, typed by him
   cd ~/repos/life-organiser && git push origin main
   ```
   The agent dies with the WSL instance. `ssh-add` succeeding is not enough; the
   push must see the same `SSH_AUTH_SOCK` (the `eval` covers it).
4. **`pnpm build` writes to stderr on success**, and **`pnpm add` prints a red
   `ERR_PNPM_IGNORED_BUILDS` even when the package installs.** Read the exit
   path, not the colour.
5. **Do not run `pnpm build` against a live `pnpm dev`.** They share `.next`;
   after a build the dev server stops answering (observed 20 Nov). Restart dev.
6. **GitHub rejects commits exposing a private email (GH007).** Check
   `git log -1 --format=%ae` before blaming the key.
7. **pnpm blocks install scripts** (`allowBuilds` in `pnpm-workspace.yaml`).
   `prisma`, `@prisma/engines` and `esbuild` are approved. A new package needing
   a postinstall stops the install — that is a security decision, so ask first.
   `next-auth` needed no build script.
8. **`cd` inside a script run as `bash /tmp/x.sh` fails** with ENOENT. Use
   `--cd` on the `wsl` command and guard with `[ -f package.json ]`.
9. **Non-interactive shells have no `node`.** Source nvm in the script:
   `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"`.
10. **Prisma prints a Node support warning on Node 26** during install. It
    proceeds; if a Prisma command misbehaves, that mismatch is the first suspect.
11. **PowerShell 5.1 rejects `&&`** and expands `$` in double-quoted arguments.
    One command per call, or the script-file workaround above.
12. **Prisma's `env()` treats an empty string as missing**, so a blank
    `DATABASE_URL=""` fails with `PrismaConfigEnvError`. That is correct
    behaviour: `prisma.config.ts` reads `.env.local` through Node's built-in
    `process.loadEnvFile`, guarded by `existsSync`.
13. **`.env.local` is the only place the connection string lives.** Do not print
    it, do not paste it into chat, do not copy it into a command line. The same
    applies to `AUTH_GOOGLE_SECRET` and `AUTH_SECRET`; the client id is public
    and may be quoted.

---

## 6. What was actually done

### 20 November — evening (Auth.js)

Decisions put to Anthony, and his answers:

- **A — dependency:** `next-auth@5.0.0-beta.32`, **pinned exactly**. v5 is the
  App Router and React 19 line; the pin stops a new beta changing behaviour
  mid-week.
- **B — user model:** **JWT sessions**, `User` row created on first sign-in. No
  Prisma adapter, therefore no `Account` or `Session` tables.
- **C — household:** **inserted by hand once**. Chosen over a seed script and
  over create-on-first-sign-in.
- **D — adapter:** presented, and he chose **no database tonight**. The adapter
  is therefore still unchosen (§0.1). Nothing was installed for it.

Written:

- `src/lib/allowlist.ts` — `parseAllowlist` and `isAllowedEmail`. Closed by
  default: a missing address or an empty list rejects everyone. Case-insensitive,
  exact match, so a lookalike domain cannot pass.
- `src/lib/auth.ts` — `NextAuth({ providers: [Google], session: { strategy:
  "jwt" }, pages: { signIn: "/login", error: "/login" }, trustHost: true })`.
  The `signIn` callback returns `isAllowedEmail(profile?.email,
  process.env.ALLOWED_EMAILS)`.
- `src/app/api/auth/[...nextauth]/route.ts` — exports `GET` and `POST` from
  `handlers`.
- `src/actions/auth.ts` — `signInWithGoogle` and `signOutOfGoogle`, both
  redirecting.
- `src/app/(auth)/login/page.tsx` — one button, phone-first, plus the
  `AccessDenied` message.
- `src/app/page.tsx` — placeholder showing the signed-in address, or a sign-in
  link. The real shell is still to come.
- `.env.example` — `(proposed)` markers removed; the comment names the pin.
- Docs — three decision-log rows, XC-1 to in progress, roadmap note.

Verified:

- `pnpm typecheck`, `pnpm lint`, `pnpm test` (**23 tests**: 15 dates + 8
  allowlist) and `pnpm build` all pass.
- `/` and `/login` return 200 with the expected states.
- `/api/auth/providers` reports `google` with callback
  `http://localhost:3000/api/auth/callback/google`.
- Posting the sign-in form returns a 302 to
  `accounts.google.com/o/oauth2/v2/auth` with the right `redirect_uri`, the
  client id present and scope `openid profile email`.
- Committed as `228065c` and pushed, with the session-close commit `9651f68`,
  after Anthony unlocked the key in a terminal window.

### 19 November — evening (first migration)

- Anthony chose **Neon** over Docker: production is Neon either way, so Docker
  would mean two database setups and meeting the differences at deploy time.
- Neon project `life-organiser`, `ap-southeast-2`, free tier. The **direct**
  connection string went into `.env.local` by his hand; never printed, never
  committed.
- `prisma.config.ts` calls `process.loadEnvFile(".env.local")` when it exists.
- `prisma migrate dev --name init` produced
  `prisma/migrations/20261119044104_init` and applied it.
- Verified independently: `migrate status` up to date, and `db pull --print`
  matches `schema.prisma`.
- `package.json` gained `db:migrate` and `db:studio`.
- Committed as `cd5f0f0` and pushed.

### 19 November — morning (OAuth client)

Full sequence in `docs/reference/oauth-setup.md`. Google Cloud project
`life-organiser`; app **Life Organiser**, External, **Testing**, one test user,
no scopes added, AI-agent checkbox unticked. Client `Life Organiser web`,
redirect URI `http://localhost:3000/api/auth/callback/google`. Client id, secret
and `AUTH_SECRET` are in `.env.local`. No production redirect URI yet.

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

**Evening, 20 Nov:** *the server decides who is allowed in; the client only
asks.* The button and Google's consent screen are requests. The `signIn`
callback runs on the server, compares the Google-verified address against
`ALLOWED_EMAILS`, and only then is a cookie minted — a tampered browser cannot
add itself to the list, because the list never leaves the server.

**Evening, 19 Nov:** *the schema is the source of truth, and a migration is
versioned SQL you commit.* Nobody edits the live database; they edit
`schema.prisma`, and Prisma translates the difference into SQL that lives in git
forever. In Prisma 7 the *shape* sits in the schema while the *connection* sits
in `prisma.config.ts` — same database, two consumers, one definition.

**Morning, 19 Nov:** *configuration is an input to the system, not part of it.*
The OAuth client, its secret and the allowlist live outside the code; the code
reads names at start-up.
