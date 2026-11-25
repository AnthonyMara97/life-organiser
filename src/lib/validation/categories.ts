import { z } from "zod";

/**
 * Category management, validated on the server.
 *
 * `parentId` arrives as "" from a select with no parent chosen, so it is
 * normalised here rather than in every caller. Whether the parent exists, is in
 * the same household, is of the same kind and is itself top-level is a database
 * question and is checked in the action.
 */
export const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name the category")
    .max(60, "Keep it under 60 characters"),
  kind: z.enum(["expense", "income"], "Choose expenses or income"),
  parentId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

/** Renaming keeps the kind and the parent; only the label changes. */
export const categoryRenameSchema = z.object({
  id: z.string().min(1, "Choose a category"),
  name: z
    .string()
    .trim()
    .min(1, "Name the category")
    .max(60, "Keep it under 60 characters"),
});

/** Archive or restore, from a plain form button. */
export const categoryArchiveSchema = z.object({
  id: z.string().min(1, "Choose a category"),
  archived: z.enum(["true", "false"]),
});
