"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/lib/nav";

// The only client-side part of the shell. It is a client component because the
// active link depends on the current URL, which only the browser knows on
// navigation; the rest of the shell stays server-rendered. Keeping this island
// small is why the session's email never becomes client data.
type NavListProps = {
  variant: "sidebar" | "tabs";
};

export function NavList({ variant }: NavListProps) {
  const pathname = usePathname();
  const isTab = variant === "tabs";

  return (
    <nav aria-label="Primary" className={isTab ? "flex" : "flex flex-col gap-1"}>
      {navItems.map((item) => {
        const active = item.href !== undefined && item.href === pathname;

        const className = isTab
          ? `relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] ${
              active
                ? "font-medium text-neutral-900"
                : item.href
                  ? "text-neutral-500"
                  : "text-neutral-300"
            }`
          : `flex items-center rounded-md px-3 py-2 text-sm ${
              active
                ? "bg-neutral-900 font-medium text-white"
                : item.href
                  ? "text-neutral-700 hover:bg-neutral-100"
                  : "text-neutral-400"
            }`;

        const indicator = isTab ? (
          <span
            aria-hidden="true"
            className={`h-0.5 w-6 rounded-full ${active ? "bg-neutral-900" : "bg-transparent"}`}
          />
        ) : null;

        return item.href ? (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={className}
          >
            {indicator}
            {item.label}
          </Link>
        ) : (
          <span
            key={item.label}
            aria-disabled="true"
            title="Coming in a later week"
            className={className}
          >
            {indicator}
            {item.label}
          </span>
        );
      })}
    </nav>
  );
}
