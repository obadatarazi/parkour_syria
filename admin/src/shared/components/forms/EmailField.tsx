import { type ComponentProps } from "react";

import { TextField } from "@/shared/components/forms/TextField";

export type EmailFieldProps = Omit<ComponentProps<typeof TextField>, "type">;

export function EmailField(props: EmailFieldProps) {
  return <TextField type="email" autoComplete="email" {...props} />;
}
