import { useMemo } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";
import { sanitizeRichText } from "@/shared/lib/rich-text.utils";

type RichTextContentProps = {
  value: string;
  dir?: "rtl" | "ltr";
  className?: string;
};

/** Read-only rendering of a rich text field, sanitized to the tags the editor writes. */
export function RichTextContent({ value, dir, className }: RichTextContentProps) {
  const html = useMemo(() => sanitizeRichText(value), [value]);

  return (
    <div
      dir={dir}
      className={cn("rich-text text-sm", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
