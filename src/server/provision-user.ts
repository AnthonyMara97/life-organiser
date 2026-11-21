import { db } from "@/lib/db";

/** The two ids the session is built from. Nothing else about a user is public. */
export type UserIdentity = {
  userId: string;
  householdId: string;
};

export type ProvisionInput = {
  email: string;
  name?: string | null;
  image?: string | null;
};

/**
 * Resolves a signed-in Google account to its `User` row, creating it the first
 * time, and returns the ids the session needs.
 *
 * Throws rather than returning a partial result. A session that cannot be tied
 * to a household is worse than no session: every query in the app scopes itself
 * by `householdId`, so there would be nothing to scope to. The caller lets the
 * throw abort sign-in.
 */
export async function provisionUser(
  input: ProvisionInput,
): Promise<UserIdentity> {
  // Google returns addresses already lowercased, but the allowlist compares
  // case-insensitively and `User.email` is a unique key. Normalising here keeps
  // one person from becoming two rows because of a capital letter.
  const email = input.email.trim().toLowerCase();

  // v1 has exactly one household. Ask for two so a second row is detected
  // rather than silently picking one — the wrong household is a data leak.
  const households = await db.household.findMany({
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: 2,
  });

  if (households.length !== 1) {
    throw new Error(
      `Expected exactly one household, found ${households.length}. ` +
        "Insert the household row once with the SQL in docs/07-handover.md.",
    );
  }

  const householdId = households[0].id;

  // Upsert, not create: signing in twice is normal, and a second sign-in must
  // not fail on the unique email. Name and image are refreshed from Google on
  // every sign-in so a changed display name does not go stale.
  const user = await db.user.upsert({
    where: { email },
    update: { name: input.name ?? null, image: input.image ?? null },
    create: {
      email,
      name: input.name ?? null,
      image: input.image ?? null,
      householdId,
    },
    select: { id: true, householdId: true },
  });

  return { userId: user.id, householdId: user.householdId };
}
