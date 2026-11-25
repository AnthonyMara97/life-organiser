export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-40 animate-pulse rounded bg-accent-soft" />
        <div className="h-4 w-56 animate-pulse rounded bg-accent-soft" />
      </div>
      <div className="h-32 animate-pulse rounded-lg border border-line bg-surface" />
      <div className="h-64 animate-pulse rounded-lg border border-line bg-surface" />
    </div>
  );
}
