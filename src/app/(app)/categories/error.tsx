"use client";

export default function CategoriesError({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-lg border border-danger-line bg-danger-soft p-6">
      <h1 className="text-base font-semibold text-danger">
        Could not load categories
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        The database did not answer. Try again; if it keeps happening, check the
        deployment logs.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Try again
      </button>
    </div>
  );
}
