import { useCallback, useMemo } from "react";

import { whatsappTemplatesService } from "@/features/whatsapp-templates/services/whatsapp-templates.service";
import {
  WHATSAPP_TEMPLATE_STATUSES,
  type WhatsAppTemplateListParams,
  type WhatsAppTemplateListResult,
} from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import { whatsAppTemplateStatusFilterLabel } from "@/features/whatsapp-templates/utils/whatsapp-template-display";
import {
  type CrudFilterDefinition,
  type CrudSortDefinition,
  mapBooleanFilterValue,
  mapStringFilterValue,
  useServerPaginatedList,
} from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const WHATSAPP_TEMPLATE_FILTER_IDS = ["isEnabled", "status"] as const;

export function useWhatsAppTemplatesList(limit = 20) {
  const t = useTranslation();

  const filterDefinitions = useMemo<CrudFilterDefinition[]>(
    () => [
      {
        id: "isEnabled",
        label: t.whatsappTemplateSwitch,
        allLabel: t.filterAll,
        primary: true,
        options: [
          { value: "true", label: t.whatsappTemplateEnabled },
          { value: "false", label: t.whatsappTemplateDisabled },
        ],
      },
      {
        id: "status",
        label: t.whatsappTemplateStatus,
        allLabel: t.filterAll,
        options: WHATSAPP_TEMPLATE_STATUSES.map((value) => ({
          value,
          label: whatsAppTemplateStatusFilterLabel(value, t),
        })),
      },
    ],
    [t],
  );

  const sortDefinitions = useMemo<CrudSortDefinition[]>(
    () => [
      {
        id: "sort",
        label: t.sortBy,
        options: [
          { value: "position:asc", label: t.sortWhatsAppDefault },
          { value: "label:asc", label: t.sortTitleAsc },
          { value: "label:desc", label: t.sortTitleDesc },
          { value: "updated_at:desc", label: t.sortNewest },
          { value: "updated_at:asc", label: t.sortOldest },
          { value: "status:asc", label: t.whatsappTemplateStatus },
        ],
      },
    ],
    [t],
  );

  const mapFiltersToParams = useCallback((values: Record<string, string>) => {
    return {
      isEnabled: mapBooleanFilterValue(values.isEnabled),
      status: mapStringFilterValue(values.status),
    } satisfies Pick<WhatsAppTemplateListParams, "isEnabled" | "status">;
  }, []);

  const fetchFn = useCallback(
    (params: WhatsAppTemplateListParams & { page: number; limit: number }, signal?: AbortSignal) =>
      whatsappTemplatesService.list(params, signal),
    [],
  );

  const list = useServerPaginatedList({
    queryKeyPrefix: "whatsapp-templates",
    fetchFn,
    limit,
    filterIds: [...WHATSAPP_TEMPLATE_FILTER_IDS],
    mapFiltersToParams,
    defaultSort: "position:asc",
  });

  const catalog = (list.data as WhatsAppTemplateListResult | undefined)?.catalog ?? null;

  return {
    ...list,
    catalog,
    filterDefinitions,
    sortDefinitions,
  };
}
