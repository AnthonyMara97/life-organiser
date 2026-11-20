import Link from "next/link";

import { signOutOfGoogle } from "@/actions/auth";
import { auth } from "@/lib/auth";

// Placeholder for the app shell (Saturday's work). It exists tonight so the
// session can be seen working from both sides: signed out, then signed in.
export default async function Home() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Life Organiser</h1>
        <p className="text-sm text-neutral-600">
          {session?.user?.email
            ? `Signed in as ${session.user.email}.`
            : "Not signed in."}
        </p>
      </div>

      {session?.user ? (
        <form action={signOutOfGoogle}>
          <button
            type="submit"
            className="w-full rounded-md border border-neutral-300 px-4 py-3 text-sm font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            Sign out
          </button>
        </form>
      ) : (
        <Link
          href="/login"
          className="rounded-md bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          Sign in
        </Link>
      )}
    </main>
  );
}
