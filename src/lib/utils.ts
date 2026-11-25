import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins class names and resolves Tailwind conflicts.
 *
 * This is shadcn/ui's convention, kept verbatim so a component copied from the
 * registry behaves as its documentation says. It is pure and safe on both sides
 * of the server/client boundary.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
