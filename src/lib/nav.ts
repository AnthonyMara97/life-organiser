// The shell's navigation in one place, because the desktop sidebar and the
// phone tab bar render the same list in different shapes.
//
// `href` is optional on purpose: a route that does not exist yet renders as a
// muted label rather than a link, so the shell never offers a dead end.
//
// `tab` marks the five that fit a phone tab bar at 390px. The sidebar shows
// everything; Accounts and Reports are reached from the dashboard on a phone
// until they have pages of their own.
export type NavItem = {
  label: string;
  href?: string;
  tab?: boolean;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", tab: true },
  { label: "Accounts" },
  { label: "Transactions", href: "/transactions", tab: true },
  { label: "Categories", href: "/categories" },
  { label: "Budgets", tab: true },
  { label: "Bills", tab: true },
  { label: "Reports" },
  { label: "Settings", tab: true },
];
