# 05 — Working Agreement

> How Anthony and the AI assistant build this together. · 15 Nov 2026
>
> The point of this file: a project this long drifts without agreed rules. These
> are the rules. Change them deliberately, not accidentally.

## 1. What each of us is responsible for

**Anthony — product owner**
- Decides what the app does, in what order, and for whom.
- Has final say on every user-facing decision.
- Must be able to explain every part of the codebase out loud.
- Reviews every change before it is committed.
- Owns the learning: if something is not understood, it stops until it is.

**The assistant — senior pair**
- Proposes designs and explains trade-offs before writing code.
- Writes most of the code in small, reviewable pieces.
- Names and explains every unfamiliar concept once.
- Flags risk early: scope, security, time, complexity.
- Refuses to ship something neither of us can explain.

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
| **The recommendation** | Which one, and why. Including what could go wrong. |
| **Cost to reverse** | Cheap now, expensive later, or effectively permanent. |

Then it **stops and waits**. No implementation, no edits to the docs on that
point, no "I went ahead and".

**Execution detail** — naming a variable, choosing a file, formatting — proceeds
without asking. Mentioning it in the summary is enough.

**Always a decision, never assumed:** the data model, dependencies, security and
auth, third-party services, scope and phasing, anything the user sees, and
anything that changes the roadmap.

**Marked as proposed until confirmed.** If a recommendation is written into a
document before Anthony has agreed to it, it is labelled `(proposed)`. A proposal
sitting in a doc is not an agreement, and must not be treated as one in a later
session.

## 2. Two working modes

We choose one at the start of each session.

| Mode | Who types | When |
|---|---|---|
| **Pair** | Assistant writes, Anthony reviews each step | New concepts, unfamiliar territory, plumbing |
| **Coach** | Anthony writes, assistant reviews | The week's "Your turn" task, and anything already seen once |

The roadmap assigns at least one coach task every week. Those are not optional —
they are how the knowledge transfers.

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

## 4. The explain-back rule

At the end of every milestone, Anthony explains one non-trivial piece back to the
assistant in his own words, without looking at the code.

If the explanation is vague, that piece is not done, regardless of whether it
works. This is the entire reason for building a portfolio project instead of
following a tutorial: in an interview, the explanation is the product.

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
- [ ] Reviewed by Anthony, not just accepted
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

## 11. What "learning" looks like here

Not: following along while code appears.

Yes:
- Predicting what a change will do before running it.
- Reading an error message and forming a hypothesis.
- Explaining a trade-off, not just a definition.
- Breaking the app on purpose and knowing where to look.
- Writing one thing a week without help.

The test of success at week 12 is not "the app works". It is "Anthony can be
dropped into the codebase cold and find his way around."
