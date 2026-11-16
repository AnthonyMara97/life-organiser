# 07 — Session Handover

> **Purpose:** the first file to read at the start of a new session. It records the
> state of the machine and the repo, what has been agreed, what has not, and the
> first actions to take. It is a working document, not a permanent record — rewrite
> it at the close of each session.
>
> **Last updated:** 16 November 2026, end of session 3.
> **Next session starts at:** "Next actions" below. The working tree is clean, but
> **nothing is pushed yet** — that is the first task.

---

## 1. Where things stand

| | Status |
|---|---|
| Planning documents | ✅ Written, reviewed, committed |
| Machine setup | ✅ WSL Ubuntu + nvm + Node 26 + pnpm |
| Next.js scaffold | ✅ Builds, typechecks, lints |
| Config decisions (A/B) | ✅ Applied and committed (`7af1e1e`, `f4302bb`) |
| Scope decision (C) | ✅ Drive replaced by CSV upload, docs updated (`553a429`) |
| First real code | ✅ `src/lib/dates.ts` + Vitest, 15 tests (`5645fa0`, `18ca292`) |
| GitHub remote | ✅ Created, public: `github.com/AnthonyMara97/life-organiser` |
| Anything pushed | ❌ **No commits are on GitHub yet** — the push is blocked on the key passphrase |
| Deployment | ❌ Not started |
| Database | ❌ Not started |
| Auth | ❌ Not started |
| App UI | ❌ Still "Hello world!" |

Commit history, oldest last:

```
18ca292 feat(dates): add calendar-day helpers with tests
5645fa0 chore(test): add Vitest and test scripts
553a429 docs(scope): replace Google Drive import with in-app CSV upload
f4302bb chore(next): disable component caching while learning
7af1e1e chore(deps): bump @types/node to match the Node 26 runtime
0349f40 docs: add session handover and record today's setup work
96a811f chore: scaffold Next.js application
65e73b5 docs: add initial project documentation
```

**Verified at close of session:** `pnpm test` (15 passing), `pnpm typecheck`,
`pnpm lint` and `pnpm build` all pass. Working tree clean.

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
| git | 2.55.0, identity `AnthonyMara97 <amarafio2@gmail.com>` |
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
   An agent was started at a fixed socket: `/tmp/ssh-agent.sock`. To unlock the key
   for the session, Anthony runs, in his own WSL terminal:

   ```bash
   SSH_AUTH_SOCK=/tmp/ssh-agent.sock ssh-add ~/.ssh/id_ed25519
   ```

   Then commands from this session can use the same socket. The agent dies with
   the WSL instance; start a new one with `ssh-agent -a /tmp/ssh-agent.sock`.
4. **`pnpm build` writes to stderr on success**, so PowerShell may show a red
   "NativeCommandError" banner even when the build passed. Read the exit code, not
   the colour.

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

1. **Unlock the SSH key and push.** The repo and commits exist only on this
   laptop. Run the `ssh-add` command in §2, then:

   ```bash
   cd ~/repos/life-organiser && git push -u origin main
   ```

2. **Read `src/lib/dates.ts` together and explain it back.** `addMonthsClamped`
   is the piece to explain — why the month total is computed from year zero, and
   why the day is clamped. Definition of done includes "Anthony can explain it".

3. **Decide the local database question** (open decision 2), then Week 1
   infrastructure: Prisma with `User` + `Household`, first migration, Auth.js with
   the two-email allowlist, app shell, Vercel deploy.

4. **When the budget period model is settled**, write the period functions with
   tests. Not before.

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
