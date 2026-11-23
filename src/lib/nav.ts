// The shell's navigation in one place, because the desktop sidebar and the
// phone tab bar render the same list in different shapes.
//
// `href` is optional on purpose: a route that does not exist yet renders as a
// muted label rather than a link, so the shell never offers a dead end.
export type NavItem = {
  label: string;
  href?: string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Accounts" },
  { label: "Transactions" },
  { label: "Budgets" },
  { label: "Bills" },
];
