import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";

// The gate for everything inside the shell. Checking here rather than in each
// page means a page under `(app)` can trust that `session.user.householdId`
// exists — the alternative is every page repeating the same guard and one of
// them eventually forgetting.
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <AppShell email={session.user.email}>
      {children}
      {/* One toast surface for every screen under the shell (D28). */}
      <Toaster />
    </AppShell>
  );
}
