import type { ReactNode } from "react";

import { signOutOfGoogle } from "@/actions/auth";
import { NavList } from "@/components/nav-list";

// The chrome that survives navigation: a sidebar on desktop, bottom tabs on a
// phone. A server component, so the signed-in address is rendered on the server
// and never handed to the browser as client data.
type AppShellProps = {
  email: string;
  children: ReactNode;
};

const signOutStyle =
  "rounded-md border border-line px-3 py-2 text-xs font-medium text-ink-muted hover:bg-accent-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function AppShell({ email, children }: AppShellProps) {
  return (
    <div className="min-h-dvh">
      {/* Desktop: fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-surface p-4 md:flex">
        <p className="px-3 pb-4 text-sm font-semibold text-ink">Life Organiser</p>
        <NavList variant="sidebar" />
        <div className="mt-auto space-y-3 px-3 pt-6">
          <p className="truncate text-xs text-ink-muted" title={email}>
            {email}
          </p>
          <form action={signOutOfGoogle}>
            <button type="submit" className={`w-full ${signOutStyle}`}>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Phone: sticky header with the way out */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur md:hidden">
        <p className="text-sm font-semibold text-ink">Life Organiser</p>
        <form action={signOutOfGoogle}>
          <button type="submit" className={signOutStyle}>
            Sign out
          </button>
        </form>
      </header>

      <div className="md:pl-60">
        {/* Extra bottom padding on phones so content clears the tab bar */}
        <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-10">
          {children}
        </main>
      </div>

      {/* Phone: fixed bottom tabs. Safe-area padding keeps the labels clear of
          the home indicator on an iPhone. */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        <NavList variant="tabs" />
      </nav>
    </div>
  );
}
