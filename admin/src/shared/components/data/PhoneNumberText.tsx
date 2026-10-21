import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type PhoneNumberTextProps = {
  value?: string | null;
  fallback?: ReactNode;
  className?: string;
};

/** True for E.164 / local digit strings (optional +, spaces, dashes, parentheses). */
export function looksLikePhoneNumber(value: string): boolean {
  const compact = value.replace(/[\s-().]/g, "");
  return /^\+?\d{6,15}$/.test(compact);
}

/**
 * Keeps `+965…` in visual LTR order inside an RTL page.
 * `inline-block` shrinks to the number so the parent still right-aligns the cell.
 */
export function PhoneNumberText({
  value,
  fallback = "—",
  className,
}: PhoneNumberTextProps) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return <>{fallback}</>;
  }

  return (
    <span dir="ltr" className={cn("inline-block [unicode-bidi:isolate]", className)}>
      {trimmed}
    </span>
  );
}

/** Wraps phone-like labels in LTR; leaves names / emails / ids unchanged. */
export function UserLabelText({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  if (looksLikePhoneNumber(value)) {
    return <PhoneNumberText value={value} className={className} />;
  }
  return <span className={className}>{value}</span>;
}
