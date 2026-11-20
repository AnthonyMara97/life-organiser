import { signInWithGoogle } from "@/actions/auth";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const denied = error === "AccessDenied";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-12">
      <div className="w-full max-w-sm space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Life Organiser</h1>
        <p className="text-sm text-neutral-600">
          Sign in with a Google account on the household allowlist.
        </p>
      </div>

      {denied ? (
        <p
          role="alert"
          className="w-full max-w-sm rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          That account is not on the household allowlist. Try an allowlisted
          address.
        </p>
      ) : null}

      <form action={signInWithGoogle} className="w-full max-w-sm">
        <button
          type="submit"
          className="w-full rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          Continue with Google
        </button>
      </form>
    </main>
  );
}
