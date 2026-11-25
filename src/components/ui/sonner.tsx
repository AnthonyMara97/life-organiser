"use client";

import { Toaster as Sonner } from "sonner";

// The toast surface (D28). Sonner renders outside React's tree, so it sits once
// in the app layout and every screen calls `toast()` from anywhere below it.
//
// `theme="system"` keeps the OS-following rule from D21: no toggle, no stored
// preference. The colours are the shell's tokens, injected as CSS variables
// because Sonner paints its own container.
export function Toaster() {
  return (
    <Sonner
      theme="system"
      position="bottom-center"
      offset={80}
      // Sonner uses a separate offset under 600px wide, and the phone has a
      // fixed 56px tab bar: without this the toast lands on top of it.
      mobileOffset={80}
      toastOptions={{
        style: {
          background: "var(--surface)",
          color: "var(--ink)",
          border: "1px solid var(--line)",
        },
        classNames: {
          description: "text-ink-muted",
          actionButton: "bg-accent text-on-accent",
          cancelButton: "bg-accent-soft text-ink",
        },
      }}
    />
  );
}
