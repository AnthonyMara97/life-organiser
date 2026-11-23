# 05 — Working Agreement

> How Anthony and the AI assistant build this together. · 15 Nov 2026, revised
> 18 Nov 2026.
>
> The point of this file: a project this long drifts without agreed rules. These
> are the rules. Change them deliberately, not accidentally.

## 1. What each of us is responsible for

**Anthony — product owner**
- Decides what the app does, in what order, and for whom.
- Has final say on every user-facing decision.
- Understands the architecture of every change before it is committed.
- Reviews every change before it is committed.
- Owns the scope: if it is not clear what is being built, it stops until it is.

**The assistant — senior engineer**
- Proposes designs and explains trade-offs before writing code.
- Writes the code, in small, reviewable pieces.
- Names the architectural concept behind each change, once.
- Flags risk early: scope, security, time, complexity.
- Refuses to ship something neither of us can explain at the architecture level.

Neither of us invents requirements. If a decision is unclear, it is asked, and the
answer is written into `01-product-brief.md`.

## The decision rule (added 15 Nov 2026)

**Anthony makes every decision.** The assistant proposes; Anthony decides. This is
not a formality — the reasoning is that control over the design is what produces
understanding, and understanding is the point of the project.

For every decision that is not pure execution detail, the assistant presents:

| | |
|---|---|
| **The decision** | One sentence. What actually needs choosing. |
| **The options** | Two or three realistic ones. Not a false choice. |
| **The recommendation** | Which one — **never omitted, never "it depends"**. What choosing it entails: what gets built, added, removed, or changes hands. Then a brief summary of why, in one or two sentences, including what could go wrong. |
| **Cost to reverse** | Cheap now, expensive later, or effectively permanent. |

Then it **stops and waits**. No implementation, no edits to the docs on that
point, no "I went ahead and". A decision sent without a recommendation is
incomplete and is not sent.

**Check the record first (added 23 Nov 2026).** Every settled decision has an ID
(`D1`, `D2`, …), listed in `docs/00-status.md` and argued in
`docs/03-architecture.md` §12. If the question is already answered there, it is
not a decision — the assistant cites the ID and carries on. Where the documents
and the live system disagree, it says so and asks which is true.

**Execution detail** — naming a variable, choosing a file, formatting — proceeds
without asking. Mentioning it in the summary is enough.

**Always a decision, never assumed:** the data model, dependencies, security and
auth, third-party services, scope and phasing, anything the user sees, and
anything that changes the roadmap.

**Marked as proposed until confirmed.** If a recommendation is written into a
document before Anthony has agreed to it, it is labelled `(proposed)`. A proposal
sitting in a doc is not an agreement, and must not be treated as one in a later
session.

## 2. How a session runs

Revised 18 Nov 2026. The pair/coach split is withdrawn along with the teaching
brief: Anthony no longer writes code as an exercise.

1. **Decide.** The assistant opens with the one decision blocking the milestone —
   one sentence, two or three options, a recommendation with what it entails and
   why, the cost to reverse — and waits.
2. **Build.** One batch, no mid-build check-ins unless something breaks or a new
   decision appears.
3. **Overview, then commit.** The assistant shows what changed and why, in the
   chat. Anthony reviews every commit and must understand it before it goes in.
   Budget up to 20 minutes beyond the session's hour.
4. **Push and close.** One logical change per commit; handover rewritten.

## 3. Session protocol

1. **Frame (2 min).** State the goal in one sentence and the files likely to
   change. If it does not map to a feature ID, we stop and decide.
2. **Plan (5 min).** Agree the smallest version that is still useful.
3. **Build.** Small diffs. After each one: what changed, why, what to try.
4. **Verify.** Run it. Both devices if it is UI. Read the error rather than
   guessing.
5. **Commit.** One logical change, message explains why.
6. **Close.** Update the learning log if a concept was learned.

If a step takes longer than expected, we say so and cut scope — we do not silently
extend the session.

## 4. The architecture rule

Replaced 18 Nov 2026. The explain-back rule — Anthony recites code in his own
words at every milestone — is withdrawn, because the project no longer teaches
coding.

Instead: at the close of each session the assistant names **one architectural
concept**, in two or three sentences, tied to the code that just changed. How the
pieces fit, or why a boundary sits where it does. Anthony asks for more whenever he
wants it; he is not examined on it.

What is tested is whether the app ships, and whether Anthony can walk another
developer through its architecture — not whether he can write it unaided.

## 5. Code rules

- TypeScript strict. No `any`, no `@ts-ignore`, no non-null assertions to silence
  a real problem.
- Every server boundary parses input with Zod.
- Every database query is household-scoped.
- Money is integer cents. Always.
- Prefer deleting code to adding abstraction.
- No new dependency without a one-sentence justification and agreement.
- A pattern used once should usually be inline; abstract on the third use, not the
  first.
- Comments explain **why**, not what. Aim them at a learner reading in six months.

## 6. Git

- `main` is always deployable.
- One branch per milestone: `feat/m1-transactions`.
- Commits: `type(scope): summary`, body explains why.
  Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
- No commit that mixes a refactor with a feature.
- Commit messages are part of the portfolio. Write them for a reader.
- Push at the end of every session, even if the work is unfinished on a branch.

## 7. Definition of done

A change is done when all of these are true:

- [ ] Works at 390px and on desktop
- [ ] Server-side validation present
- [ ] Household scoping verified
- [ ] Loading, empty and error states exist
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass
- [ ] Reviewed by Anthony **before** the commit, not after
- [ ] Relevant doc updated
- [ ] Committed with a why-message

## 8. Data safety

Non-negotiable, every session:

- `.env.local` is never committed. `.env.example` holds names only.
- No real balances, addresses, surnames, receipts or calendar entries in the repo,
  in screenshots, in logs, or in a pull request description.
- Seed data is fictional and obviously so ("Demo Household").
- Anything sent to an AI provider is the minimum needed, never a full ledger.
- If you are unsure whether something is sensitive: it is. Keep it out.

## 9. Scope discipline

- New ideas are welcome. They go to `02-features.md` §8 within the session, with
  an ID and a phase.
- Nothing is added to the current milestone without removing something of equal
  size.
- "While I'm in here" changes are how weeks turn into months. They get their own
  commit, or they wait.

## 10. When something goes wrong

| Situation | Response |
|---|---|
| Stuck for more than 15 minutes | Say so. We debug together or step back and simplify. |
| A week is missed | Re-plan the roadmap. Do not "catch up" by compressing two weeks into one. |
| A milestone slips | Cut its P1/P2 features, keep its P0. The date matters more than the polish. |
| The assistant proposes something unjustifiable | Push back. "Why this and not the simpler thing?" is always a fair question. |
| Real data enters the repo | Stop, remove it from history, rotate anything exposed, then continue. |
| Motivation drops | Go back to §5 of the brief: is the app saving time yet? If not, ship something small that does. |

## 11. What "learning" means here (revised 18 Nov 2026)

The learning this project is responsible for is **architectural**: where the
pieces live, what each layer is allowed to do, and why the boundaries sit where
they do. Coding fundamentals are learned elsewhere, on Anthony's own study plan.

Not this project's job: syntax, language features, beginner walkthroughs, or
writing code as an exercise.

Success at week 16: the app is deployed and used daily, and Anthony can walk
another developer through its architecture — data model, request path, auth
boundary, and the decisions behind them — without notes.
