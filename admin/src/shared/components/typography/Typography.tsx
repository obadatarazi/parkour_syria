import { type ReactNode } from "react";

import { cn } from "@/shared/design-system/components/ui/utils";

type TypographyProps = {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  id?: string;
};

export function PageTitle({ children, className, as: Tag = "h1" }: TypographyProps) {
  return (
    <Tag className={cn("text-2xl font-semibold tracking-tight text-foreground", className)}>
      {children}
    </Tag>
  );
}

export function SectionTitle({ children, className, as: Tag = "h2" }: TypographyProps) {
  return <Tag className={cn("text-lg font-semibold text-foreground", className)}>{children}</Tag>;
}

export function CardTitleText({ children, className, as: Tag = "h3" }: TypographyProps) {
  return <Tag className={cn("text-base font-semibold text-foreground", className)}>{children}</Tag>;
}

export function BodyText({ children, className, as: Tag = "p" }: TypographyProps) {
  return <Tag className={cn("text-sm text-foreground", className)}>{children}</Tag>;
}

export function CaptionText({ children, className, as: Tag = "span" }: TypographyProps) {
  return <Tag className={cn("text-xs text-muted-foreground", className)}>{children}</Tag>;
}

export function HelperText({ children, className, as: Tag = "p", id }: TypographyProps) {
  return (
    <Tag id={id} className={cn("text-xs text-muted-foreground", className)}>
      {children}
    </Tag>
  );
}

export function ErrorText({ children, className, as: Tag = "p", id }: TypographyProps) {
  return (
    <Tag id={id} className={cn("text-xs text-destructive", className)} role="alert">
      {children}
    </Tag>
  );
}
