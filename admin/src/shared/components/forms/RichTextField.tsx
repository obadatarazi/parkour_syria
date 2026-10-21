import { lazy, Suspense } from "react";

import type { RichTextFieldProps } from "@/shared/components/forms/RichTextEditor";

const RichTextEditor = lazy(() => import("@/shared/components/forms/RichTextEditor"));

/** The rich text editor, fetched the first time a form shows one. */
export function RichTextField(props: RichTextFieldProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">{props.label}</span>
          <div
            className="animate-pulse rounded-md border border-input bg-muted/40"
            style={{ height: `${(props.rows ?? 10) * 1.75 + 2.75}rem` }}
          />
        </div>
      }
    >
      <RichTextEditor {...props} />
    </Suspense>
  );
}
