# 07 — Session Handover

> **Purpose:** the first file to read at the start of a new session. It records the
> state of the machine and the repo, what has been agreed, what has not, and the
> first actions to take. It is a working document, not a permanent record — rewrite
> it at the close of each session.
>
> **Last updated:** 15 November 2026, end of session 2.
> **Next session starts at:** "Next actions" below. There is no work in progress and
> no uncommitted changes.

---

## 1. Where things stand

| | Status |
|---|---|
| Planning documents | ✅ Written, reviewed, committed (`65e73b5`) |
| Machine setup | ✅ WSL Ubuntu + nvm + Node 26 + pnpm |
| Next.js scaffold | ✅ Generated, builds, typechecks, lints (`96a811f`) |
| App code | ❌ None of our own yet — the home page still says "Hello world!" |
| GitHub remote | ❌ Not created. Nothing pushed anywhere |
| Deployment | ❌ Not started |
| Database | ❌ Not started |
| Auth | ❌ Not started |

Commit history, oldest last:

```
96a811f chore: scaffold Next.js application
65e73b5 docs: add initial project documentation
```

Both commits are local only. If this laptop dies tonight, the work is gone — the
GitHub remote is a real task, not housekeeping.

**Verified at close of session:** production build passes, `pnpm typecheck` passes,
`pnpm lint` passes, working tree clean, dev server started successfully by Anthony
and the page loaded in a browser.

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
| VS Code | connected in WSL mode; badge bottom-left reads `WSL: Ubuntu` |

Windows has no Node, pnpm or git. Do not run project commands from PowerShell.

### Four behaviours that will waste time if forgotten

1. **`node` only exists in an interactive shell.** Ubuntu's `.bashrc` returns early
   for non-interactive shells, and nvm installs itself there. Use
   `wsl -d Ubuntu -- bash -ic '...'` (`-i`), never `bash -lc` (`-l`), or `node`
   resolves to "command not found" and looks like a broken install.
2. **Quotes and `$VAR` are eaten between PowerShell and bash.** Paths containing
   spaces must be written with a glob instead: `Default*Project`. Prefer absolute
   paths with no spaces.
3. **Globs in `wsl` commands are expanded by bash, not passed through.** For `find`,
   either quote the pattern (if quoting survives) or pipe through `grep -v`.
4. **A commit message written to a temp file must be `rm`'d before `git add -A`,**
   or the message file itself enters the commit. This happened once and needed an
   amend; `git show --stat` caught it.

### How Anthony opens the project

In VS Code: Command Palette → **WSL: Open Folder in WSL** →
`/home/anthony/repos/life-organiser`. He has already been caught once typing into a
Windows-mode terminal, so confirm the prompt reads
`anthony@...:~/repos/life-organiser$` before he runs anything.

Do not tell him to paste error messages into the terminal. He did that once and bash
tried to execute the text, producing a wall of `command not found`.

---

## 3. Decisions made this session

| Decision | Choice | Consequence |
|---|---|---|
| Project location | Inside Ubuntu, `~/repos/life-organiser` | Docs moved in, Windows copy deleted |
| Node install method | nvm, no sudo | Version switching available later |
| Scaffolding | **Option C** — scaffold now, hand-rebuild a minimal version later in a scratch repo as a learning exercise | Real project keeps momentum; understanding comes from the exercise |
| Date helpers | Hand-written, not `date-fns` | More code, fully understood |
| Everything he writes | Hand-written rather than library abstraction, for now | Applied to future dependency proposals |

Still true from the planning session: three-clock model, seam list, explicit
`startsOn`/`endsOn` budget periods, public repo with no real data, finances first.

**Not formally confirmed** (he said "happy with what you have written so far" rather
than approving each): the two-tier ledger (confirmed vs draft) and
savings-goal-as-P0. Treat both as proposed. `BudgetPeriod` in
`docs/03-architecture.md` is still marked `(proposed)` and must stay that way until
he confirms it.

---

## 4. Decisions still open — ask before coding

These block the next code step. All three came out of the scaffold review.

**A. `@types/node` is `^20`; Node is 26.**
Options: bump to `^26`, or leave it. Recommendation was bump, so the type checker
knows the runtime it actually runs on. Reversal cost: one line and one install.

**B. `cacheComponents: true` is enabled in `next.config.ts`.**
Options: turn it off now, or keep it on. Recommendation was **off**, so pages render
fresh while he is learning and "my data is stale" is not a recurring puzzle. Honest
caveat given: the impact on our code is not fully predictable until the first
data-backed page exists, so this may need revisiting. Reversal cost: one line.

**C. Is Google Drive dropped from v1?**
The plan says CSV import. Drive appears in `docs/03-architecture.md` and in the
learning log's "still fuzzy" note. It has been implied dropped but never confirmed.
The roadmap still contains a Drive week (W10), so this needs an explicit answer
before that week is planned or removed.

Do not implement any of these on assumption.

---

## 5. Next actions, in order

1. **Get answers to A, B and C.**
2. **Apply whichever of A and B he chooses**, verify `pnpm build`, `pnpm typecheck`
   and `pnpm lint` still pass, commit.
3. **Add Vitest and write the first real code:** `addDays`, `daysBetween`,
   `addMonthsClamped`, each with tests, in `src/lib/dates.ts`. Plain TypeScript, no
   React, no database. This needs approval as a new dependency.
4. **Then the period functions** from the approved seam list:
   `getPeriodContaining`, `getActiveSchedule`, `getPeriodsBetween`.
5. **Then finish week 1** as written in `docs/04-roadmap.md`: GitHub remote and first
   push, Vercel deploy, Neon database, Prisma with `User` + `Household`, Auth.js with
   a two-email allowlist, app shell.

The GitHub remote should probably move up the list — see the warning in section 1.

### The teaching method agreed with him

Plain English first, then the code, then the technical term for what he just saw.
He is a beginner: he needs to know what a function, a variable and a test are, and
will learn generics and narrowing by writing rather than reading. Do not open with
jargon.

---

## 6. Cost of the scaffold, recorded honestly

`create-next-app` produced 11 files. Two were replaced: the template `README.md` and
`AGENTS.md` were discarded in favour of the project's own; the Next.js guidance for
coding agents is preserved at `docs/reference/nextjs-agent-notes.md`. Everything else
is as generated, with two edits — `package.json` name changed from `scaffold-tmp` to
`life-organiser`, and a `typecheck` script added.

The generator's opinions we have not reviewed yet, and owe him an explanation for:
`target: "ES2017"` in `tsconfig.json`, `allowJs: true`, `sharp: false` and
`unrs-resolver: false` in `pnpm-workspace.yaml` (install scripts blocked — a
security default), and `partialPrefetching: true` in `next.config.ts`.

The hand-rebuild exercise in `~/repos/scratch-next` is still owed. It is a learning
task, not a project task; it can wait until a week with slack, but do not let it
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
