# 06 — Learning Log

> A running record of concepts learned, in the order they came up, phrased so they
> can be used in an interview. Update at the close of each session.
>
> **Status:** `to learn` · `learning` · `can explain` · `can build from scratch`

## Why this file exists

By week 12 the goal is not "I built an app". It is "I can explain the app". This
log is the difference between having done something and being able to talk about
it. Re-read it before any interview; it is also the outline of a portfolio
write-up.

## The rule

A concept moves to `can explain` only when it can be described **in one or two
sentences, without notes, to someone who does not code**. `Can build from
scratch` requires having done it in this project, unaided.

---

## Concept checklist

### Language and types
| Concept | Why it came up | Status |
|---|---|---|
| Static vs dynamic typing | Choosing TypeScript | to learn |
| `interface` vs `type` | Modelling transaction inputs | to learn |
| Union types and narrowing | `needs_review \| confirmed` | to learn |
| Generics | Prisma query helpers | to learn |
| `strict` mode and `null` | Money fields that may be absent | to learn |
| Type inference vs annotation | Zod schemas producing types | to learn |

### React and Next.js
| Concept | Why it came up | Status |
|---|---|---|
| Component, props, state | Every screen | to learn |
| Server components vs client components | Deciding where code runs | to learn |
| Server actions | Form submissions without a hand-built API | to learn |
| Routing and layouts | App shell, nested routes | to learn |
| `revalidatePath` and caching | Showing fresh data after a write | to learn |
| Optimistic UI | Instant feedback on add/delete | to learn |
| Controlled forms and validation | Transaction form | to learn |
| Client vs server boundary (and why secrets stay server-side) | API keys | to learn |

### Data
| Concept | Why it came up | Status |
|---|---|---|
| Relational modelling, foreign keys | Household → transactions | to learn |
| Migrations vs schema push | Evolving the database safely | to learn |
| Indexes and why queries get slow | Dashboard aggregates | to learn |
| Aggregate queries (`SUM`, `GROUP BY`) | Budget actuals | to learn |
| Derived vs stored data | Why balances are computed | to learn |
| Idempotency | Importing the same CSV twice | to learn |
| Soft delete | Archiving categories | to learn |
| Integer cents vs floating point | `0.1 + 0.2 !== 0.3` | to learn |
| Dates vs timestamps, and timezones | `Australia/Melbourne` month boundaries | to learn |
| Recurrence maths | Bill due on the 31st, in February | to learn |

### Platform and infrastructure
| Concept | Why it came up | Status |
|---|---|---|
| Environment variables and secrets | Keys, database URLs | to learn |
| OAuth 2.0, access vs refresh tokens, scopes | Google sign-in; Drive deferred to FIN-11 | to learn |
| Least-privilege access | Requesting only the scopes a feature needs | to learn |
| Session cookies and `httpOnly` | Auth.js sessions | to learn |
| Encryption at rest for tokens | Not needed in v1; revisit if Phase 2 stores tokens | to learn |
| Deployments, previews, CI | Vercel | to learn |
| PWA and service workers | Installing on phones | to learn |
| Structured LLM output and cost control | AI capture | to learn |

### Engineering practice
| Concept | Why it came up | Status |
|---|---|---|
| Small commits and why | Every session | learning |
| Tests that protect money and dates | Week 11 | to learn |
| Reading an error message before changing code | Every bug | learning |
| Technical writing | README as portfolio | to learn |
| Explaining a trade-off | Every review | to learn |

---

## Session entries

Newest first. One entry per session where something was genuinely learned.

### Template

```md
### 2026-11-15 — Session title

**Built:** one line.
**Learned:** the concept, in my own words, two sentences maximum.
**Still fuzzy:** what I could not explain yet.
**Next:** the first thing to do next session.
```

---

### 2026-11-15 — Environment and scaffold

**Built:** WSL Ubuntu toolchain (nvm, Node 26.13.1, pnpm 12.21.0), the project
directory, and a Next.js 16 scaffold that passes build, typecheck and lint.

**Learned:** two things that had nothing to do with app code. First, "installed" is
not the same as "available" — Node existed only in interactive shells, because
`.bashrc` skips setup for non-interactive ones, so a correct install looked broken.
Second, a terminal executes whatever it is given: pasting an error message into it
makes bash try to run the error text as programs. Both cost real time and neither
was a code problem.

**Still fuzzy:** what `cacheComponents: true` will actually do to a data-backed page,
and where the Windows/Linux boundary ends (why quotes and `$VAR` vanish between
PowerShell and bash).

**Next:** decide `@types/node` version and the caching flag, then write the three
date helpers with tests.

---

### 2026-11-15 — Project planning

**Built:** nothing yet. Product brief, feature spec, architecture, roadmap and
this agreement written and reviewed.

**Learned:** a specification is a set of decisions, not a description. Writing
down what we are *not* building (no bank feeds, no native app, no real data in the
repo) prevents more waste than any feature list. Also: money stored as integer
cents, because floating point cannot represent `$0.10` exactly.

**Still fuzzy:** how much the Google Drive OAuth setup will actually fight back.

**Next:** week 1 — repo, scaffold, deploy, auth.
