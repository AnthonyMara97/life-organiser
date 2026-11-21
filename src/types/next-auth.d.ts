import type { DefaultSession } from "next-auth";

// What a signed-in session carries.
//
// The ids are the point: every server query filters by `householdId`, so the
// session has to hand them to the code that runs after `auth()`. Declared here
// once, so no call site has to cast.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      householdId: string;
    } & DefaultSession["user"];
  }
}
