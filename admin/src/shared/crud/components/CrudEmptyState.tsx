import { FilterX, Inbox, Lock, SearchX } from "lucide-react";
import { type ReactNode } from "react";

import { EmptyState } from "@/shared/components";
import type { CrudEmptyVariant } from "@/shared/crud/types/crud.types";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CrudEmptyStateProps = {
  variant: CrudEmptyVariant;
  action?: ReactNode;
};

export function CrudEmptyState({ variant, action }: CrudEmptyStateProps) {
  const t = useTranslation();

  const content = {
    "no-records": {
      icon: <Inbox className="size-6" />,
      title: t.crudNoRecordsTitle,
      description: t.crudNoRecordsDescription,
    },
    "no-search-results": {
      icon: <SearchX className="size-6" />,
      title: t.crudNoSearchResultsTitle,
      description: t.crudNoSearchResultsDescription,
    },
    "no-filter-results": {
      icon: <FilterX className="size-6" />,
      title: t.crudNoFilterResultsTitle,
      description: t.crudNoFilterResultsDescription,
    },
    "permission-denied": {
      icon: <Lock className="size-6" />,
      title: t.crudPermissionDeniedTitle,
      description: t.crudPermissionDeniedDescription,
    },
    "first-time": {
      icon: <Inbox className="size-6" />,
      title: t.crudFirstTimeTitle,
      description: t.crudFirstTimeDescription,
    },
  }[variant];

  return (
    <EmptyState
      icon={content.icon}
      title={content.title}
      description={content.description}
      action={action}
    />
  );
}
