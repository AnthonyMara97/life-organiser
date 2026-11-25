"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { renameCategory } from "@/actions/categories";
import type { CategoryFormState } from "@/actions/categories";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const initialState: CategoryFormState = { status: "idle" };

const fieldClass =
  "mt-1 w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

type Props = { id: string; name: string };

/**
 * Renaming only. The kind and the parent are structural: changing them would
 * mean re-filing every transaction that points at the category, which is a
 * different action with its own decision. Archive is the way out of a mistake.
 */
export function RenameCategoryDialog({ id, name }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-ink-muted hover:bg-accent-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Rename
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename category</DialogTitle>
          <DialogDescription>
            The new name applies everywhere, including the transactions already
            filed here.
          </DialogDescription>
        </DialogHeader>
        <RenameForm id={id} name={name} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function RenameForm({ id, name, onSaved }: Props & { onSaved: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    renameCategory,
    initialState,
  );

  const savedAt = state.status === "success" ? state.savedAt : undefined;
  useEffect(() => {
    if (!savedAt) return;
    toast.success("Category renamed");
    router.refresh();
    onSaved();
  }, [savedAt, onSaved, router]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <label className="block text-xs font-medium text-ink-muted">
        Name
        <input
          name="name"
          maxLength={60}
          required
          autoFocus
          defaultValue={name}
          aria-invalid={state.fieldErrors?.name ? true : undefined}
          className={fieldClass}
        />
        {state.fieldErrors?.name ? (
          <span role="alert" className="mt-1 block text-xs text-danger">
            {state.fieldErrors.name}
          </span>
        ) : null}
      </label>

      {state.message ? (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save name"}
        </button>
      </div>
    </form>
  );
}
