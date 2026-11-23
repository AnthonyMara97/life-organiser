# 07 — Session Handover

**Last updated:** 23 November 2026, end of the Monday session (the Sunday session
was missed, so this one carried both). **Week 1 is complete** — the app is
deployed and Anthony has signed in on his phone.
**Next action:** `00-status.md` is the position. The two-person allowlist test,
then Week 2's opening decisions.
Run `git status -sb` before anything else.

> **Position lives in `docs/00-status.md`.** Read that first: one page, the
> milestone and build item, the settled decisions (`D1`–`D22`) and what is still
> open. This file is the detail behind it. A decision that appears in
> `00-status.md` as settled is settled — cite it, do not re-open it.

---

## 0. Start here

### 0.1 Where the weekend session got to

The Sunday session was missed; Monday 23 November combined it with that day's
hour. What landed:

- **The shell**, committed `e1c7571` and verified against a real Google session:
  the `(app)` layout gates on `auth()`, the desktop sidebar and the 390px bottom
  tab bar render, the active nav link follows the URL. Plain Tailwind (D19).
- **XC-3 closed on 23 Nov:** the dashboard lives at `/dashboard` (`/` redirects),
  dark mode follows the operating system with no toggle (D21), the sidebar lists
  seven areas and the phone bar keeps the five that fit, and the sign-in page
  uses the same tokens including the `AccessDenied` state.
- **`prisma generate` moved from `postinstall` into `build`** (`8d9df39`), so an
  install on a machine without `.env.local` no longer fails.
- **The deploy runbook deleted** (`747bfda`) — it described a production branch
  that did not exist at the time.
- **`.env.local` moved onto the `dev` Neon branch** (D20); `production` is now
  reserved for the deployed app. Both branches carry the same single migration
  and the same single household row.
- **Deployed and proven on 23 Nov:** Vercel project `life-organiser`, domain
  `life-organiser-eight.vercel.app`, database on the `production` branch. Anthony
  signed in from his phone — Week 1's acceptance test. Week 1 is closed.

### 0.2 What is deployed

| Piece | Value |
|---|---|
| Domain | `https://life-organiser-eight.vercel.app` |
| Vercel project | `marafioti/life-organiser`, auto-deploys on push to `main` |
| Database | Neon branch `production`, **pooled** connection, `sslmode=verify-full` |
| Env vars | `DATABASE_URL`, `AUTH_SECRET`, `ALLOWED_EMAILS`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — **Production only** (D22) |
| Google redirect URIs | `https://life-organiser-eight.vercel.app/api/auth/callback/google`, `http://localhost:3000/…`, `http://127.0.0.1:3000/…` |
| Build command | `package.json`'s `build` → `prisma generate && next build`; no Vercel override |

Verified from outside with no session: `/` and `/dashboard` return 307 to
`/login`; `/login` renders; `/api/auth/providers` reports exactly the callback
URI above. Changing any env var requires a redeploy before it takes effect.

### 0.3 Still open, and what Week 2 needs

Week 1 closed on 23 Nov. Week 2 does not start until these are answered.

**The budget period model** — fortnightly, monthly, or two-tier. Blocks the
period functions. `BudgetPeriod` stays marked `(proposed)` in
`docs/03-architecture.md` until Anthony confirms.

**Two-tier ledger** (`needs_review` vs `confirmed`) and **savings-goal-as-P0** —
also unconfirmed from earlier sessions.

**Anthony's own task: his wife's Google Account**, created from her Outlook
address, then that address added **both** as a Google test user and to the Vercel
`ALLOWED_EMAILS` (which needs a redeploy). As of 23 Nov, `ALLOWED_EMAILS` holds
**one** address — Anthony's — and the `production` branch has one `User` row.

Use that task to close the untested rejection path: **she signs in before her
address is added.** Expect `/login` with `AccessDenied` and the `User` count to
stay at 1. Then add her and have her sign in again. That is the two-person
acceptance test, and it is the only part of XC-1 not yet evidenced.

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
| Prisma driver adapter | ✅ `@prisma/adapter-pg@7.10.1` + `pg@8.23.1`, in `src/lib/db.ts` |
| Database | ✅ Neon project, Sydney. Branch `production` (for the deployed app) and `dev` (local). One migration applied to both |
| Google OAuth client | ✅ Created 19 Nov, Publishing status Testing |
| **Auth.js** | ✅ `next-auth@5.0.0-beta.32`, pinned exactly |
| Allowlist | ✅ Enforced server-side in `signIn`; 8 tests |
| Sign-in page | ✅ `/login` renders and redirects to Google |
| `Household` row | ✅ One row, `household_v1`, inserted by hand 21 Nov |
| **`User` provisioning** | ✅ Built and verified 21 Nov — one row, one household, no orphans |
| Two-person test | ❌ Blocked on his wife's account (§0.3) |
| App UI | ✅ Shell closed against XC-3 on 23 Nov — sidebar, phone tabs, OS dark mode, `/dashboard` |
| Deployment | ✅ Live at `life-organiser-eight.vercel.app`, production branch, phone sign-in proven 23 Nov (D22) |
| GitHub remote | ✅ `github.com/AnthonyMara97/life-organiser` |
| Roadmap | ✅ 6 hours/week, 16 weeks |

Commit history, newest first:

```
46b87da docs: close XC-3, record D21 and put accounts in the folder tree
9d33ea3 feat(shell): close XC-3 with OS dark mode and the dashboard route
97be195 docs: record the dev branch, the build change and the closed decisions
747bfda docs: remove the deploy runbook until the deploy is decided
8d9df39 chore(deploy): generate the Prisma client during build
c9e157f docs: make the project position and settled decisions impossible to miss
b4d7001 chore(deploy): generate the Prisma client on install and record the runbook
e1c7571 feat(shell): add the app shell behind the sign-in gate
2115b2c docs: record that the provisioning session is pushed
0de9b41 docs: record the adapter decision and close the provisioning session
d78898a feat(auth): provision the User row on sign-in
```

The 23 Nov commits close this session — this file, the status page, the decision
log and the feature status. `main` and `origin/main` were level at the
session-close commit.

---

## 3. Week 1, as it happened — Thursday 19 to Monday 23 November

| When | Hour | Goal |
|---|---|---|
| ~~Thu 19~~ | ~~1h~~ | ✅ Database decision, Neon created, first migration applied |
| ~~Fri 20~~ | ~~1h~~ | ✅ Auth.js with Google, the `ALLOWED_EMAILS` allowlist, sign-in page |
| ~~Sat 21~~ | ~~30m~~ | ✅ Household row by hand, adapter decision, `User` provisioning |
| ~~Sun 22~~ | — | Missed. |
| ~~Mon 23~~ | 1h 30m | ✅ Shell closed against XC-3, `dev` branch, first deploy, phone sign-in |

Sunday was missed, so Week 1 finished on Monday. Nothing was compressed to catch
up. Week 2 starts at the next session and opens with the budget period decision
(§4).

---

## 4. Next actions, in order

1. **Two-person allowlist test** (his hands): his wife signs in **before** her
   address is added — expect `/login?error=AccessDenied` and the `User` count
   unchanged; then add her to the Google test users *and* to the Vercel
   `ALLOWED_EMAILS`, redeploy, and have her sign in.
2. **Week 2's opening decisions**, before any code: the budget period model, the
   two-tier ledger, and whether savings goals are P0.
3. Add `db:seed` only when a demo household exists — deliberately absent now.
4. When the budget period model is settled, write the period functions with
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
| Branches | `dev` (local development) and `production` (the deployed app) |
| Local connection | branch `dev`, **direct** (host has no `-pooler`), `sslmode=require` |
| Deployed connection | branch `production`, **pooled** (`-pooler`), `sslmode=verify-full`, set as a Vercel env var |
| Where each lives | `.env.local` holds the `dev` string (mode 600, never committed); Vercel holds the `production` string |
| Migration | `prisma/migrations/20261119044104_init` — applied to both branches |
| Household row | ✅ `household_v1` — one per branch; `dev` was copied from `production` |
| User rows | ✅ One, created by a real sign-in on 21 Nov |

Pooling is deliberately **off** in the local URL: `prisma migrate` cannot run
through a pooled connection. The deployed app takes the pooled `production`
string, where pooling is what keeps many short-lived serverless connections from
exhausting Postgres.

### Behaviours that waste time if forgotten

1. **`node` only exists in an interactive shell.** Use
   `wsl -d Ubuntu -- bash -ic '...'`, not `bash -lc`. Verify with `node -v`
   before blaming a script.
2. **PowerShell eats `$?`, `|` inside quotes, and `<`/`>` in arguments.** Write a
   short `.sh` to `/mnt/c/Users/amara/AppData/Local/Temp/opencode/` and run it
   with `wsl -d Ubuntu --cd /home/anthony/repos/life-organiser -- bash
   /mnt/c/.../x.sh`. Scripts should `[ -f package.json ]` rather than `cd`.
3. **The push needs Anthony's passphrase once per WSL session — set the agent up
   immediately, then never ask again.** No SSH agent runs by default and the key
   is passphrase-protected, so a push without one waits forever for a prompt an
   agent cannot type (it hung for 120s on 20 Nov).

   **Standing instruction from Anthony (20 Nov):** the moment a push is wanted,
   start the agent on a **fixed socket** and open the terminal window for him at
   once, so he types the passphrase exactly once. After that, every push in the
   session uses that socket — do not ask him again, and do not reopen the window
   "to be safe". Check with `SSH_AUTH_SOCK=/tmp/ssh-agent.sock ssh-add -l` first;
   if the key is listed, just push.

   Setup, run in his terminal window (a human types the passphrase):
   ```bash
   ssh-agent -a /tmp/ssh-agent.sock
   SSH_AUTH_SOCK=/tmp/ssh-agent.sock ssh-add ~/.ssh/id_ed25519
   ```
   Then every push from any later command:
   ```bash
   SSH_AUTH_SOCK=/tmp/ssh-agent.sock git push origin main
   ```

   The fixed path is the whole point. `eval "$(ssh-agent -s)"` invents a random
   socket under `/tmp/ssh-XXXX/`, which no later process can find, and closing
   the window loses it. With `-a /tmp/ssh-agent.sock` the agent is a daemon that
   outlives the window, so the window can be closed straight after the prompt.
   It still dies with the WSL instance (`wsl --shutdown`, or a Windows restart) —
   then the passphrase is needed once more.

   To open the window, write a short `.sh` and launch it detached, e.g.:
   ```powershell
   Start-Process -FilePath wsl.exe -ArgumentList '-d','Ubuntu','--cd',
     '/home/anthony/repos/life-organiser','--','bash','/mnt/c/.../unlock.sh'
   ```
   Keep the script's last line a `read -p "Press Enter to close..."` so the output
   stays visible. Do not put the passphrase, or anything derived from it, in a
   file, a command line, or chat.

   **Anything that talks to the remote needs the socket, not just `push`.**
   `git ls-remote` and `git fetch` without `SSH_AUTH_SOCK` wait for a passphrase
   prompt that no agent can answer — it hung for 120s on 21 Nov while checking the
   push had landed. The push itself was fine; only the check was missing the
   variable.
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
   `next-auth`, `@prisma/adapter-pg` and `pg` needed no build script.
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
14. **`http://localhost:3000` failed in the browser on 21 Nov** with a DNS error
    while the dev server was healthy; `http://127.0.0.1:3000` worked. The server
    listens on `*:3000` and Windows reaches it — try the literal IP before
    debugging Next or WSL port forwarding.
15. **`pg` warns about `sslmode=require`** on every run: it currently behaves as
    `verify-full`, and v9 will change what `require` means. The local `dev` string
    still says `require` (harmless, and matches what Neon generates); the Vercel
    string says `verify-full` explicitly.

---

## 6. What was actually done

### 23 November — Monday (shell closed, environments separated, first deploy)

Sunday 22 November was missed; this session carried both days.

- `8d9df39` moved `prisma generate` from `postinstall` into `build`, so an
  install without `.env.local` no longer fails.
- `747bfda` deleted the deploy runbook, whose opening paragraph asserted a
  production branch split that did not exist.
- `97be195` recorded D20 and rewrote the position in the status page and here.
- `9d33ea3` closed XC-3: colour tokens with OS-following dark mode (D21), the
  dashboard at `/dashboard` with `/` redirecting, seven sidebar areas, five phone
  tabs, and the sign-in page on the same tokens including `AccessDenied`.
- Neon: created the `dev` branch and pointed `.env.local` at its **direct**
  string; `production` reserved for the deployed app. Verified with
  `prisma migrate status` (up to date) and read-only counts (1 household, 1 user).
- Vercel: project created, the five environment variables set for **Production
  only** (D22), deployed, the three Google redirect URIs added, and a real phone
  sign-in. Week 1 closed.

### 21 November — household row and user provisioning

Decision put to Anthony, and his answer:

- **Adapter:** `@prisma/adapter-pg@7.10.1` + `pg` (option A). Rejected
  `@prisma/adapter-neon`, which expects the `-pooler` host that dev deliberately
  does not use.

Anthony's hand:

- Inserted the single `Household` row in the Neon SQL editor, id
  `household_v1`, with a name of his choosing. The name is real household data
  and is **not recorded anywhere in this repo** — read it from the database if
  it is ever needed. An earlier attempt had left the literal placeholder text
  in `name`; it was corrected with a scoped `UPDATE` rather than a delete and
  re-insert.

Written:

- `src/lib/db.ts` — one `PrismaClient` on `PrismaPg`, cached on `globalThis`
  outside production so hot reload does not leak pools. Throws an explicit error
  when `DATABASE_URL` is missing, because `pg` otherwise falls back to
  `localhost:5432` and disguises the real fault.
- `src/server/provision-user.ts` — reads the household (`take: 2`, so a second
  row is detected rather than silently chosen), upserts the `User` by
  lowercased email, returns `{ userId, householdId }`. Refreshes name and image
  on every sign-in.
- `src/types/next-auth.d.ts` — `session.user.id` and `session.user.householdId`.
- `src/lib/auth.ts` — `signIn` runs the allowlist first, then provisions, so a
  database failure aborts sign-in before a cookie exists. `jwt` provisions on
  first mint and puts the ids on the token. `session` exposes them.

Gotcha worth recording: **`declare module "next-auth/jwt"` does nothing in this
version.** Auth.js re-exports its `JWT` interface from `@auth/core`, and module
augmentation does not reach a re-export. The `session` callback narrows the
token values with `typeof` instead. The `next-auth` `Session` augmentation does
work.

Verified:

- `pnpm typecheck`, `pnpm lint`, `pnpm test` (**23 tests**: 15 dates + 8
  allowlist — no new tests; provisioning is database-coupled and was verified
  against the live dev database instead) and `pnpm build` all pass.
- Real sign-in in the browser, then a counts-only query against the dev
  database: 1 household, 1 user, 1 distinct household used, 0 users without a
  household.
- Second sign-in updated the row rather than adding one.
- **Not yet verified at runtime:** a non-allowlisted address. The branch returns
  `false` before any query, and the allowlist tests cover the decision — but the
  evidence comes with the two-person test (§0.3).

Committed as `d78898a`; `0de9b41` closed the session. Both pushed after Anthony
unlocked the SSH key, and `origin/main` was confirmed at `0de9b41`.

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
  was therefore still unchosen until 21 Nov.

Written:

- `src/lib/allowlist.ts` — `parseAllowlist` and `isAllowedEmail`. Closed by
  default: a missing address or an empty list rejects everyone. Case-insensitive,
  exact match, so a lookalike domain cannot pass.
- `src/lib/auth.ts` — `NextAuth({ providers: [Google], session: { strategy:
  "jwt" }, pages: { signIn: "/login", error: "/login" }, trustHost: true })`.
- `src/app/api/auth/[...nextauth]/route.ts` — exports `GET` and `POST` from
  `handlers`.
- `src/actions/auth.ts` — `signInWithGoogle` and `signOutOfGoogle`, both
  redirecting.
- `src/app/(auth)/login/page.tsx` — one button, phone-first, plus the
  `AccessDenied` message.
- `src/app/page.tsx` — placeholder showing the signed-in address, or a sign-in
  link. The real shell is still to come.

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

### 19 November — morning (OAuth client)

Full sequence in `docs/reference/oauth-setup.md`. Google Cloud project
`life-organiser`; app **Life Organiser**, External, **Testing**, one test user,
no scopes added, AI-agent checkbox unticked. Client `Life Organiser web`,
redirect URI `http://localhost:3000/api/auth/callback/google`. The production and
`127.0.0.1` redirects were added on 23 Nov.

---

## 7. What to read, in what order

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

## 8. The session's architectural concept

**23 November:** *a design token names a role, not a colour.* `--surface` means
"whatever a card sits on" — white in light mode, near-black in dark — so
`app-shell.tsx` never learns which theme is running and dark mode is one media
query instead of a `dark:` variant on every element. The same session's deploy
made the matching point about environments: the deployed app is the same code
with different inputs. The database string, the secret and the allowlist are
configuration injected at build and run time, which is why nothing in `src/`
changed between the laptop and the phone.

**21 November:** *a driver adapter is the seam between the application and the
network.* Prisma generates the query; the adapter owns the socket, the pool and
the Postgres wire protocol. That seam is why the same schema can sit on a direct
Neon connection in development and a pooled endpoint in production without the
application code changing — and why the connection string, not the code, moves
between environments.

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
