# Deploy runbook — Vercel + Neon `production` branch

> Written 23 November 2026, before the first deploy. Steps that have not been
> run yet are marked **(unverified)**. Correct this file the first time through,
> then drop the marks.

Decided 23 Nov: production data lives on a **Neon branch named `production`** of
the existing `life-organiser` project, not on the dev database. Same console,
isolated rows, and the pooled endpoint of that branch is what Vercel gets.

Order matters: the OAuth client needs the Vercel domain, and the app needs the
database to exist before the first sign-in.

## 1. Neon — create the production branch

1. Neon console → project `life-organiser` → **Branches** → **New branch**.
2. Name `production`, parent `main` (whatever the default branch is called).
3. Open the branch's **Connect** dialog, choose **Pooled connection**, copy the
   string. The host contains `-pooler`.
4. Append `?sslmode=verify-full` if it is not already there. Do **not** use
   `require`: `pg` treats it as `verify-full` today but warns that v9 will not.

Never paste this string into chat, a commit, or a command line that gets logged.
It goes straight into Vercel's environment variables (step 3).

## 2. Vercel — create the project

1. **Add New → Project**, import `github.com/AnthonyMara97/life-organiser`.
2. Framework preset: Next.js (auto-detected). Root directory: leave blank.
3. Leave the build and install commands alone. `packageManager` in
   `package.json` pins pnpm, and `postinstall` runs `prisma generate` — without
   that the build has no Prisma client, because `node_modules` is not committed.
4. Do not deploy yet; add the variables first.

## 3. Vercel — environment variables

Add each to **Production** and **Preview**. Names only here; values by hand.

| Name | Value |
|---|---|
| `DATABASE_URL` | the **pooled** `production` branch string from step 1.4 |
| `AUTH_SECRET` | generate a **new** one: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Not the dev value — a leaked dev secret must not mint production cookies |
| `ALLOWED_EMAILS` | the same two addresses as dev, comma-separated |
| `AUTH_GOOGLE_ID` | the existing client id — public, safe to paste |
| `AUTH_GOOGLE_SECRET` | from the password manager |

`AUTH_URL` is not needed: `trustHost: true` is set in `src/lib/auth.ts`, and
Vercel forwards the original host.

## 4. Deploy

Deploy from the dashboard, then note the domain, normally
`life-organiser-<something>.vercel.app`.

## 5. Google — production redirect URI

Google Cloud Console → APIs & Services → Credentials → the `Life Organiser web`
client → **Authorised redirect URIs**, add:

- `https://<vercel-domain>/api/auth/callback/google`
- `http://127.0.0.1:3000/api/auth/callback/google` (the workaround host; see the
  23 Nov `redirect_uri_mismatch` in the handover)

Leave `http://localhost:3000/api/auth/callback/google` in place for dev.

The OAuth app stays in **Testing**: only listed test users can sign in. That is
the second layer behind `ALLOWED_EMAILS`, and the reason the wife's address must
be added in **both** places.

## 6. Migrate the production branch — once

The `production` branch starts as a copy of its parent, so it usually inherits
every migration. Check before assuming:

```bash
prisma migrate status     # with DATABASE_URL pointed at the production branch
```

If anything is pending, `prisma migrate deploy` applies it. Do **not** run
`migrate dev` against production: it can reset the database.

Keep the string out of the shell history: write a temporary file with mode 600,
source it, then delete it.

## 7. Acceptance test — Week 1's done-when

Open the Vercel URL **on a phone**, sign in with an allowlisted Google account,
land on the empty dashboard. Then sign out and sign in again: the `User` row is
upserted, not duplicated.

## 8. If something fails

| Symptom | Likely cause |
|---|---|
| `redirect_uri_mismatch` from Google | the exact domain/port is not in the client's authorised list — check scheme and `www` |
| Build fails on `@prisma/client` | `postinstall` did not run, or devDependencies were skipped |
| Sign-in loops back to `/login` | `AUTH_SECRET` differs between deployments, or `ALLOWED_EMAILS` is empty (closed by default) |
| `AccessDenied` on `/login` | the address is not in `ALLOWED_EMAILS`, or (Testing) not a Google test user |
| Database error on first query | pooled string missing `-pooler`, or `sslmode` not `verify-full` |
