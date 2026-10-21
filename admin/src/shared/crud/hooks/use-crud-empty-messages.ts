import type { CrudEmptyVariant } from "@/shared/crud/types/crud.types";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

export function useCrudEmptyMessages(variant: CrudEmptyVariant | null) {
  const t = useTranslation();

  if (!variant) return null;

  const messages = {
    "no-records": {
      title: t.crudNoRecordsTitle,
      description: t.crudNoRecordsDescription,
    },
    "no-search-results": {
      title: t.crudNoSearchResultsTitle,
      description: t.crudNoSearchResultsDescription,
    },
    "no-filter-results": {
      title: t.crudNoFilterResultsTitle,
      description: t.crudNoFilterResultsDescription,
    },
    "permission-denied": {
      title: t.crudPermissionDeniedTitle,
      description: t.crudPermissionDeniedDescription,
    },
    "first-time": {
      title: t.crudFirstTimeTitle,
      description: t.crudFirstTimeDescription,
    },
  } as const;

  return messages[variant];
}
