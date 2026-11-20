"use server";

import { signIn, signOut } from "@/lib/auth";

// Server actions for the two transitions a person can make: in and out. Both
// redirect, so neither returns a value the client could act on.
export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutOfGoogle() {
  await signOut({ redirectTo: "/" });
}
