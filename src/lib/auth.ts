import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { isAllowedEmail } from "@/lib/allowlist";

// Auth.js configuration.
//
// The client asks; the server decides. Everything in this file runs on the
// server, and the browser never sees the allowlist or the decision.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  // JWT sessions by decision: no `Session` or `Account` tables, so no Prisma
  // adapter. The signed-in person is resolved to a `User` row in the signIn
  // callback once household provisioning exists (Saturday's work).
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  // Vercel terminates TLS and forwards the original host. Auth.js refuses to
  // build callback URLs from an untrusted Host header, so it must be told that
  // the proxy in front of it is trustworthy. Harmless locally.
  trustHost: true,
  callbacks: {
    signIn({ profile }) {
      // Runs before a session exists. The Google-verified address is the only
      // thing that can get someone in — a tampered browser cannot add itself
      // to this list.
      return isAllowedEmail(profile?.email, process.env.ALLOWED_EMAILS);
    },
  },
});
