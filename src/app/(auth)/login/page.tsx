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
        <p className="text-sm text-ink-muted">
          Sign in with a Google account on the household allowlist.
        </p>
      </div>

      {denied ? (
        <p
          role="alert"
          className="w-full max-w-sm rounded-md border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          That account is not on the household allowlist. Try an allowlisted
          address.
        </p>
      ) : null}

      <form action={signInWithGoogle} className="w-full max-w-sm">
        <button
          type="submit"
          className="w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Continue with Google
        </button>
      </form>
    </main>
  );
}
