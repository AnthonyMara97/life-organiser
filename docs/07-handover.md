# 07 — Session Handover

> **Purpose:** the first file to read at the start of a new session. It records the
> state of the machine and the repo, what has been agreed, what has not, and the
> first actions to take. It is a working document, not a permanent record — rewrite
> it at the close of each session.
>
> **Last updated:** 16 November 2026, end of session 3.
> **Next session starts at:** §0 — the first five minutes. Everything in the repo
> is committed and pushed; confirm with `git status -sb`.

---

## 0. Start here — the first five minutes

**Do this before anything else: before asking what to work on, before reading code
together, before planning.** Anthony asked to be prompted at the start of this
session. This is a standing request, not a suggestion.

1. Ask him to open `src/lib/dates.ts` and read `addMonthsClamped` — the last
   function in the file — either aloud or in his own words.
2. Ask him two questions about it:
   - *Why is the month total counted from year zero?*
   - *Why is the day clamped to the end of the month instead of carrying over?*
3. Work it through with concrete examples if the answer is shaky:
   `addMonthsClamped("2026-01-31", 1)` → `"2026-02-28"` (not 3 March), and
   `addMonthsClamped("2026-03-31", -1)` → `"2026-02-28"` (not 2 March).
4. Do not move on until he can explain it. The working agreement says a piece is
   not done until it can be explained back; that is the whole reason the project
   exists. If it takes ten minutes, take ten minutes.

Only after that does the session start properly (frame → plan → build → verify →
commit).

---

## 1. Where things stand

| | Status |
|---|---|
| Planning documents | ✅ Written, reviewed, committed |
| Machine setup | ✅ WSL Ubuntu + nvm + Node 26 + pnpm |
| Next.js scaffold | ✅ Builds, typechecks, lints |
| Config decisions (A/B) | ✅ Applied and committed |
| Scope decision (C) | ✅ Drive replaced by CSV upload, docs updated |
| First real code | ✅ `src/lib/dates.ts` + Vitest, 15 tests |
| GitHub remote | ✅ Created, public: `github.com/AnthonyMara97/life-organiser` |
| Anything pushed | ✅ Clean and level with `origin/main` — confirm with `git status -sb` |
| Deployment | ❌ Not started |
| Database | ❌ Not started |
| Auth | ❌ Not started |
| App UI | ❌ Still "Hello world!" |

Commit history, oldest last. Hashes changed when the author email was rewritten;
trust the subjects if a hash ever looks wrong, and `git log -1` for the tip.

```
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

**Verified at close of session:** `pnpm test` (15 passing), `pnpm typecheck`,
`pnpm lint` and `pnpm build` all pass. Working tree clean. Local `HEAD` and
`origin/main` matched at `d4e58b7` and the remote page showed 10 commits. Confirm
with `git status -sb`: it must not say ahead or behind.

---

## 2. The machine, as it actually is

Everything lives inside Ubuntu, not Windows.

| Thing | Value |
|---|---|
| Distro | Ubuntu on WSL2, user `anthony` |
| Project path (Linux) | `/home/anthony/repos/life-organiser` |
| Project path (Windows) | `\\wsl.localhost\Ubuntu\home\anthony\repos\life-organiser` |
| Node | v26.13.1 LTS, installed by nvm into `~/.nvm` |
| npm | 11.20.0 (ships with Node) |
| pnpm | 12.21.0, installed globally via npm |
| nvm | v0.41.0 |
| git | 2.55.0. Global identity `AnthonyMara97 <amarafio2@gmail.com>`; this repo overrides the email to the GitHub no-reply address |
| GitHub CLI | ❌ Not installed (no `gh` in WSL or Windows) |
| SSH key | `~/.ssh/id_ed25519`, **passphrase-protected**, registered on GitHub as "WSL Ubuntu - Anthony (ed25519)" |
| Remote | `git@github.com:AnthonyMara97/life-organiser.git` (public) |
| VS Code | connected in WSL mode; badge bottom-left reads `WSL: Ubuntu` |

Windows has no Node, pnpm or git. Do not run project commands from PowerShell.

### Behaviours that will waste time if forgotten

1. **`node` only exists in an interactive shell.** Use
   `wsl -d Ubuntu -- bash -ic '...'` (`-i`), never `bash -lc` (`-l`).
2. **PowerShell eats `$?` and inner double quotes before bash sees them.** A check
   like `...; echo EXIT:$?` reports PowerShell's last result (`True`), not the
   command's. Long `git commit -m "..."` commands also lose their quoting. Write a
   short `.sh` file into `/tmp` and run `wsl -d Ubuntu -- bash /tmp/script.sh`.
3. **Non-interactive SSH cannot use the passphrase-protected key.** GitHub accepts
   the key (fingerprint matches), but signing fails without a passphrase prompt.
   An agent runs at a fixed socket: `/tmp/ssh-agent.sock`, unlocked once with:

   ```bash
   SSH_AUTH_SOCK=/tmp/ssh-agent.sock ssh-add ~/.ssh/id_ed25519
   ```

   The agent dies with the WSL instance. After a restart, start a new one with
   `ssh-agent -a /tmp/ssh-agent.sock`, add the key again, and prefix SSH commands
   with `SSH_AUTH_SOCK=/tmp/ssh-agent.sock`.
4. **`pnpm build` writes to stderr on success**, so PowerShell may show a red
   "NativeCommandError" banner even when the build passed. Read the exit code, not
   the colour.
5. **GitHub rejects pushes that expose a private email (GH007).** The repo-local
   `user.email` is now the GitHub no-reply address. A commit made with the global
   Gmail identity will be rejected on push; check `git log -1 --format=%ae` before
   suspecting the key. Never "fix" this by making the Gmail public.

### How Anthony opens the project

In VS Code: Command Palette → **WSL: Open Folder in WSL** →
`/home/anthony/repos/life-organiser`. Confirm the prompt reads
`anthony@...:~/repos/life-organiser$` before he runs anything.

Do not tell him to paste error messages into the terminal.

---

## 3. Decisions made this session

| Decision | Choice | Consequence |
|---|---|---|
| A. `@types/node` | Bump to `^26` | Types describe the runtime actually used |
| B. Caching | `cacheComponents` **and** `partialPrefetching` off | Next.js refuses to build with one on and the other off, so they move together. Pages render fresh; revisit when caching is learned deliberately |
| C. Google Drive import | **Dropped from v1.** FIN-8 becomes in-app CSV upload; file parsed in memory and discarded. Drive parked as FIN-11 (Phase 2, P2) | Week 9 is tractable and testable; OAuth returns with calendar integration |
| Calendar-day representation | **ISO strings** (`"2026-11-16"`), arithmetic via `src/lib/dates.ts` | A day never becomes an instant; month-boundary and DST bugs cannot occur by construction |
| Test runner | Vitest added | Justification: the runner the architecture already names, needed for date and money logic |
| Git author email | Repository now commits as the GitHub no-reply address | Keeps the real Gmail out of a public repo; GitHub refuses pushes that expose a private email (GH007). Earlier commits were rewritten before the first push |

Recorded in `docs/03-architecture.md` §12 and `docs/01-product-brief.md` §10.

**Still unconfirmed:** the two-tier ledger (confirmed vs draft) and
savings-goal-as-P0. `BudgetPeriod` in `docs/03-architecture.md` is still marked
`(proposed)` and must stay that way until Anthony confirms it.

---

## 4. Decisions still open — ask before coding

1. **Budget period model.** Fortnightly, monthly, or two-tier. Blocks the period
   functions (`getPeriodContaining`, `getActiveSchedule`, `getPeriodsBetween`) and
   Week 2. Do not write them against the proposed schema.
2. **Local database.** Docker Postgres versus a Neon dev branch from day one.
   Neon is less to install; Docker teaches the local workflow employers use. This
   blocks the first Prisma migration.
3. **Google Cloud OAuth client** for Auth.js sign-in. Needs a Cloud project and
   consent screen; credentials are Anthony's to create. Budget a session.

---

## 5. Next actions, in order

1. **§0 first — the `addMonthsClamped` read-back.** It is a gate, not an optional
   warm-up. Do not start new work until Anthony has explained it.

2. **Decide the local database question** (open decision 2), then Week 1
   infrastructure: Prisma with `User` + `Household`, first migration, Auth.js with
   the two-email allowlist, app shell, Vercel deploy.

3. **When the budget period model is settled**, write the period functions with
   tests. Not before.

### Shared context, in brief

`AGENTS.md` is authoritative; this is the digest a fresh agent needs so it does not
contradict the last three sessions.

- **The product:** a private household app for exactly two people, built partly as
  a learning vehicle and portfolio piece. Finances come first. The repository is
  public; no real household data, balances, addresses or names may enter it.
- **Agreed and not to be relitigated without Anthony:** Next.js + TypeScript +
  Tailwind; PostgreSQL + Prisma; Auth.js with Google and a two-email allowlist;
  money as integer cents; calendar days as ISO strings; CSV upload instead of
  Google Drive; AI capture in Phase 4; component caching off.
- **Still proposed, not agreed:** the two-tier ledger (`needs_review` vs
  `confirmed`) and savings-goal-as-P0. `BudgetPeriod` stays marked `(proposed)`.
- **He decides, you propose.** For anything that is not execution detail, give one
  sentence of decision, two or three real options, a recommendation with what
  could go wrong, and the cost to reverse — then stop. Never "I went ahead and".
- **Execution detail proceeds:** names, file placement, formatting. Mention it in
  the summary.
- **No dependency without a one-sentence justification and his agreement.**
- **British spelling in prose and UI** ("organise", "colour"); US spelling in code
  identifiers to match libraries.
- **Commits:** one logical change, Conventional Commits, body explains **why**.
  Push at the end of every session.
- **Definition of done:** mobile and desktop, server-side validation,
  household-scoped queries, loading/empty/error states, `pnpm typecheck`,
  `pnpm lint`, `pnpm test`, docs updated, and Anthony can explain the change.
- **Where the fuller memory lives:** `docs/05-working-agreement.md` (how we work),
  `docs/03-architecture.md` §12 (every technical decision and what was rejected),
  `docs/06-learning-log.md` (what he has actually learned), `docs/02-features.md`
  §8 (parked scope, including FIN-11 Drive).

### The teaching method agreed with him

Plain English first, then the code, then the technical term for what he just saw.
He is a beginner: he needs to know what a function, a variable and a test are, and
will learn generics and narrowing by writing rather than reading. Do not open with
jargon.

---

## 6. The scaffold, recorded honestly

`create-next-app` produced 11 files. The template `README.md` and `AGENTS.md` were
replaced; Next.js's guidance for coding agents is preserved at
`docs/reference/nextjs-agent-notes.md`. `package.json` was renamed to
`life-organiser`, a `typecheck` script added, and this session added `test` and
`test:watch`.

Still unreviewed, and owed an explanation: `target: "ES2017"` and `allowJs: true`
in `tsconfig.json`, and `sharp: false` / `unrs-resolver: false` in
`pnpm-workspace.yaml` (install scripts blocked — a security default).
`partialPrefetching` has now been removed along with `cacheComponents`.

The hand-rebuild exercise in `~/repos/scratch-next` is still owed. It is a learning
task, not a project task; it can wait for a week with slack, but do not let it
disappear silently.

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
