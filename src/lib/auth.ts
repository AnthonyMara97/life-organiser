import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { isAllowedEmail } from "@/lib/allowlist";
import { provisionUser } from "@/server/provision-user";

// Auth.js configuration.
//
// The client asks; the server decides. Everything in this file runs on the
// server, and the browser never sees the allowlist or the decision.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  // JWT sessions by decision: no `Session` or `Account` tables, so Auth.js has
  // no database adapter and `provisionUser` writes the one `User` row itself.
  // (The driver adapter in `src/lib/db.ts` is unrelated — that one connects
  // Prisma to Postgres.)
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  // Vercel terminates TLS and forwards the original host. Auth.js refuses to
  // build callback URLs from an untrusted Host header, so it must be told that
  // the proxy in front of it is trustworthy. Harmless locally.
  trustHost: true,
  callbacks: {
    async signIn({ user, profile }) {
      // Runs before a session exists. The Google-verified address is the only
      // thing that can get someone in — a tampered browser cannot add itself
      // to this list.
      const email = profile?.email ?? user.email;

      if (!email || !isAllowedEmail(email, process.env.ALLOWED_EMAILS)) {
        return false;
      }

      // Provisioning happens before any cookie is minted. If the database is
      // unreachable or the household is missing, this throws and the sign-in
      // fails — a session with no household would be a session every query in
      // the app would then have to refuse.
      await provisionUser({ email, name: user.name, image: user.image });

      return true;
    },

    async jwt({ token, user }) {
      // `user` is only present when the token is first minted, at sign-in, so
      // this runs once per sign-in rather than on every session read. The
      // upsert is idempotent; running it here is what puts the ids on the token
      // that the session callback can then expose.
      if (user?.email) {
        const { userId, householdId } = await provisionUser({
          email: user.email,
          name: user.name,
          image: user.image,
        });

        token.userId = userId;
        token.householdId = householdId;
      }

      return token;
    },

    session({ session, token }) {
      // `token` is typed from Auth.js's own JWT interface, which is re-exported
      // from `@auth/core` — so the documented `declare module "next-auth/jwt"`
      // augmentation does not reach it. Narrow the values instead of casting:
      // a cookie minted before this change simply has no ids.
      const { userId, householdId } = token;

      if (typeof userId === "string" && typeof householdId === "string") {
        session.user.id = userId;
        session.user.householdId = householdId;
      }

      return session;
    },
  },
});
