import { type ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/design-system/components/ui/card";
import { cn } from "@/shared/design-system/components/ui/utils";

type AppCardProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  padding?: "none" | "default";
};

export function AppCard({
  children,
  title,
  description,
  footer,
  className,
  contentClassName,
  padding = "default",
}: AppCardProps) {
  const hasHeader = Boolean(title || description);

  return (
    <Card className={cn("gap-0 py-0 shadow-sm transition-shadow duration-200", className)}>
      {hasHeader ? (
        <CardHeader className="border-0 px-6 pt-6 pb-4">
          {title ? <CardTitle className="text-base">{title}</CardTitle> : null}
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
      ) : null}
      <CardContent
        className={cn(
          padding === "default" && "px-6 pb-6",
          padding === "none" && "p-0",
          hasHeader ? "pt-0" : padding === "default" && "pt-6",
          contentClassName,
        )}
      >
        {children}
      </CardContent>
      {footer ? <CardFooter className="px-6 pb-6 pt-0">{footer}</CardFooter> : null}
    </Card>
  );
}
