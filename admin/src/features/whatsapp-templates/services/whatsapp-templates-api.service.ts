import type { WhatsAppTemplatesService } from "@/features/whatsapp-templates/services/whatsapp-templates.service.types";
import type {
  WhatsAppTemplate,
  WhatsAppTemplateFormData,
  WhatsAppTemplateListParams,
  WhatsAppTemplateListResult,
} from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import {
  mapWhatsAppTemplateCatalogFromApi,
  mapWhatsAppTemplateFromApi,
  mapWhatsAppTemplatePreviewFromApi,
  mapWhatsAppTemplateTestResultFromApi,
  unwrapWhatsAppTemplateList,
} from "@/features/whatsapp-templates/utils/map-whatsapp-template-from-api";
import { apiRequest, type LaravelSuccessResponse } from "@/shared/lib/api";

function buildUpdatePayload(data: WhatsAppTemplateFormData): { isEnabled: boolean; note: string | null } {
  const note = data.note.trim();
  return {
    isEnabled: data.isEnabled,
    note: note === "" ? null : note,
  };
}

function sortTemplates(
  items: WhatsAppTemplate[],
  sort: string | undefined,
  direction: "asc" | "desc" | undefined,
): WhatsAppTemplate[] {
  if (!sort || sort === "position") return items;

  const factor = direction === "desc" ? -1 : 1;
  const valueOf = (item: WhatsAppTemplate): string => {
    switch (sort) {
      case "label":
        return item.label;
      case "template_name":
        return item.templateName ?? "";
      case "updated_at":
        return item.updatedAt ?? "";
      case "status":
        return item.status.value;
      default:
        return item.event;
    }
  };

  return [...items].sort((left, right) => valueOf(left).localeCompare(valueOf(right)) * factor);
}

function toListResult(
  templates: WhatsAppTemplate[],
  params: WhatsAppTemplateListParams = {},
): WhatsAppTemplateListResult {
  const search = params.search?.trim().toLowerCase();
  let items = templates;

  if (search) {
    items = items.filter((item) =>
      [item.label, item.event, item.templateName, item.description, item.note]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(search)),
    );
  }

  if (params.status) {
    items = items.filter((item) => item.status.value === params.status);
  }

  if (params.isEnabled !== undefined) {
    items = items.filter((item) => item.isEnabled === params.isEnabled);
  }

  items = sortTemplates(items, params.sort, params.direction);

  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.limit && params.limit > 0 ? params.limit : 20;
  const start = (page - 1) * pageSize;

  return {
    data: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
    catalog: templates[0]?.catalog ?? null,
  };
}

function createApiWhatsAppTemplatesService(): WhatsAppTemplatesService {
  return {
    async list(params: WhatsAppTemplateListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>("/admin/whatsapp-templates", {
        signal,
      });
      const templates = unwrapWhatsAppTemplateList(response.data).map(mapWhatsAppTemplateFromApi);
      return toListResult(templates, params);
    },

    async getByEvent(event, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(
        `/admin/whatsapp-templates/${encodeURIComponent(event)}`,
        { signal },
      );
      return mapWhatsAppTemplateFromApi(response.data);
    },

    async update(event, data) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(
        `/admin/whatsapp-templates/${encodeURIComponent(event)}`,
        {
          method: "PUT",
          body: buildUpdatePayload(data),
        },
      );
      return mapWhatsAppTemplateFromApi(response.data);
    },

    async preview(event, parameters) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(
        `/admin/whatsapp-templates/${encodeURIComponent(event)}/preview`,
        {
          method: "POST",
          body: parameters ? { parameters } : {},
        },
      );
      return mapWhatsAppTemplatePreviewFromApi(response.data);
    },

    async sync() {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>("/admin/whatsapp-templates/sync", {
        method: "POST",
      });
      const payload =
        response.data && typeof response.data === "object"
          ? (response.data as { templates?: unknown; catalog?: unknown })
          : {};
      const templates = unwrapWhatsAppTemplateList(payload.templates).map(mapWhatsAppTemplateFromApi);
      const catalog = mapWhatsAppTemplateCatalogFromApi(payload.catalog);
      return {
        data: templates,
        total: templates.length,
        page: 1,
        pageSize: Math.max(templates.length, 1),
        catalog: templates[0]?.catalog ?? catalog,
      };
    },

    async sendTest(event, phone, parameters) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(
        `/admin/whatsapp-templates/${encodeURIComponent(event)}/test`,
        {
          method: "POST",
          body: {
            phone,
            ...(parameters ? { parameters } : {}),
          },
        },
      );
      return mapWhatsAppTemplateTestResultFromApi(response.data);
    },
  };
}

export { createApiWhatsAppTemplatesService };
