# Google OAuth client — setup runbook

> Recorded 19 November 2026, morning session. It documents a one-off Google Cloud
> configuration, so that it can be repeated when the client is deleted, the
> project is replaced, or production needs its own credentials.
>
> Google keeps renaming this surface. In November 2026 the menu is
> **APIs & Services → Google Auth Platform**, with tabs *Branding · Audience ·
> Clients · Data access*. Older documentation calls it the "OAuth consent
> screen". The functions are the same; the labels move.

## What this creates, and what it does not

A **web** OAuth client gives the *application* an identity at Google: the client
ID and secret prove that a sign-in request comes from Life Organiser. It does not
decide who may use the app — that is `ALLOWED_EMAILS`, checked in our own
`signIn` callback, server-side. Two separate trust decisions, in two places.

No Google APIs are enabled. No Drive, Calendar or Gmail scopes are requested, in
this runbook or at runtime.

## Values produced

| Generated in Google | Goes to `.env.local` as |
|---|---|
| Client ID (`…apps.googleusercontent.com`) | `AUTH_GOOGLE_ID` |
| Client secret (`GOCSPX-…`) | `AUTH_GOOGLE_SECRET` |
| — | `AUTH_SECRET` (generated locally, not by Google) |

Variable names follow the Auth.js v5 convention and remain **(proposed)** until
the dependency is approved.

## 1. Project

1. Sign in to <https://console.cloud.google.com> with the owning account.
2. **New project** → name `life-organiser` → **No organisation**.
3. Billing is not required. Do not enable any API.

## 2. Branding and audience

**Google Auth Platform → Get started** (or **Branding**):

- App name: `Life Organiser`. **No logo** — a logo triggers brand review.
- User support email and developer contact: the owner's address.
- Audience: **External**.
- App domain, privacy policy and terms links: leave empty while in Testing.
- Authorised domains: leave empty. `localhost` is not permitted there anyway;
  the production domain is added when it exists.

Publishing status stays **Testing**.

## 3. Test users

**Audience → Test users → + Add users.** In Testing status this list is the only
thing Google will let through, so an unlisted address fails at Google before our
allowlist is consulted.

- Add every household address. The account used to create the project is not a
  test user automatically.
- A Google Account is not a Gmail address: an existing email address can be used
  to create one via "Use my current email address instead".

The 7-day refresh-token expiry that Testing status imposes does not apply here:
the app uses JWT sessions and never stores a Google refresh token.

## 4. Client

**Clients → + Create client**:

| Field | Value |
|---|---|
| Application type | **Web application** |
| Name | `Life Organiser web` |
| Authorised JavaScript origins | empty — not used by a server-side flow |
| Authorised redirect URIs | see §5 |
| Use this client for an AI-powered agent | **unticked** — this client serves human sign-in from our server, not an agent |

Untick the AI-agent box on purpose. Google treats agentic clients as a separate
class, recommends not mixing agent and non-agent traffic in one client, and the
flag cannot simply be switched off later.

## 5. Redirect URIs

Exact strings — scheme, host, port, case and absence of trailing slash all
matter:

```
http://localhost:3000/api/auth/callback/google
https://<production-domain>/api/auth/callback/google
```

- The path is Auth.js's default callback: `/api/auth/callback/google`.
- The production URI is added once the Vercel project exists. Vercel preview
  deployments get unique hostnames and Google allows no wildcards, so a preview
  URL must be added individually if it is ever needed.
- A mismatch produces `redirect_uri_mismatch`, the most common failure in this
  setup.

## 6. Secrets

The client secret is displayed **once**. Copy it immediately.

- Store it in a password manager and in `.env.local`. Never in the repository,
  a commit, a screenshot, or a chat.
- If it is lost: **Clients → the client → Add secret** mints another. The old one
  can then be deleted. Losing it is an inconvenience, not a rebuild.

## 7. Verification

Without printing any value:

```bash
grep -c PASTE .env.local                      # 0
grep -oE '^AUTH_GOOGLE_ID="[^"]{60,}"' …      # shape check, not a value dump
```

Practical checks: the client ID is ~72 characters and ends
`.apps.googleusercontent.com`; the secret starts `GOCSPX-` and is ~35
characters; `AUTH_SECRET` is 44 characters of base64. A successful sign-in is
only possible once the Auth.js code exists — until then the values are inert.

## 8. Screenshots

If screenshots are added, crop the account chip and avatar in the console's
top-right corner: they contain an email address. No real household identifiers
in the repository, ever. Store them under `docs/reference/oauth-setup/` if
needed; the written steps above are the primary record.

## 9. Reversing

Cheap, in every direction:

- **Untick/republish**: toggle **Publish app** under Audience. Reverts in one
  click.
- **Bad client**: delete it in Clients and make a new one. Two values change in
  `.env.local`; nothing else is affected.
- **Different project**: repeat this runbook; the only consequence is new
  credentials.
