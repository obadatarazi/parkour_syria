import { type ComponentProps } from "react";

import { TextField } from "@/shared/components/forms/TextField";
import { cn } from "@/shared/design-system/components/ui/utils";

export type PhoneFieldProps = Omit<ComponentProps<typeof TextField>, "type">;

export function PhoneField({ className, ...props }: PhoneFieldProps) {
  return (
    <TextField
      type="tel"
      autoComplete="tel"
      inputMode="tel"
      {...props}
      dir="ltr"
      className={cn("rtl:text-right", className)}
    />
  );
}
