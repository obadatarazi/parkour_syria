import { type ReactNode } from "react";

type CrudDetailFieldProps = {
  label: string;
  children: ReactNode;
};

/** Label + value block used inside `CrudViewDialog` detail sections. */
export function CrudDetailField({ label, children }: CrudDetailFieldProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}
