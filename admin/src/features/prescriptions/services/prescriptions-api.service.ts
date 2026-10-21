import type { PrescriptionsService } from "@/features/prescriptions/services/prescriptions.service.types";
import type {
  Prescription,
  PrescriptionFormData,
  PrescriptionListParams,
} from "@/features/prescriptions/types/prescriptions.types";
import { mapPrescriptionFromApi } from "@/features/prescriptions/utils/map-prescription-from-api";
import {
  apiRequest,
  appendFile,
  appendNumberArray,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  submitMultipartFormData,
} from "@/shared/lib/api";
import {
  decodeAdminRouteKey,
  isNumericAdminRouteKey,
} from "@/shared/lib/routing/admin-route-keys.utils";
import { ServiceError } from "@/shared/errors";

function buildPrescriptionFormData(data: Partial<PrescriptionFormData>): FormData {
  const formData = new FormData();

  if (data.userId != null) {
    formData.append("user_id", String(data.userId));
  }
  if (data.status !== undefined) {
    formData.append("status", data.status);
  }
  if (data.notes !== undefined) {
    formData.append("notes", data.notes);
  }
  if (data.productIds !== undefined) {
    if (data.productIds.length === 0) {
      formData.append("product_ids", "");
    } else {
      appendNumberArray(formData, "product_ids", data.productIds);
    }
  }
  appendFile(formData, "file", data.file);

  return formData;
}

function buildPrescriptionJsonPayload(data: Partial<PrescriptionFormData>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (data.status !== undefined) {
    payload.status = data.status;
  }
  if (data.notes !== undefined) {
    payload.notes = data.notes;
  }
  if (data.productIds !== undefined) {
    payload.productIds = data.productIds;
  }

  return payload;
}

function createApiPrescriptionsService(): PrescriptionsService {
  const service: PrescriptionsService = {
    async list(params: PrescriptionListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Prescription>>(
        "/admin/prescriptions",
        {
          signal,
          params: buildLaravelListParams(
            {
              page: params.page,
              limit: params.limit,
              search: params.search,
              userId: params.userId,
              prescriptionNumber: params.prescriptionNumber,
              status: params.status,
              sort: params.sort,
              direction: params.direction,
            },
            { limit: 20 },
          ),
        },
      );
      return mapPaginatedFromApi(response, mapPrescriptionFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<Prescription>>(
        `/admin/prescriptions/${id}`,
        { signal },
      );
      return mapPrescriptionFromApi(response.data);
    },

    async getByNumber(prescriptionNumber, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<Prescription>>(
        `/admin/prescriptions/number/${encodeURIComponent(prescriptionNumber)}`,
        { signal },
      );
      return mapPrescriptionFromApi(response.data);
    },

    async resolveRouteKey(routeKey, signal?: AbortSignal) {
      const decoded = decodeAdminRouteKey(routeKey) ?? routeKey.trim();
      if (!decoded) {
        throw new ServiceError("not_found");
      }
      if (isNumericAdminRouteKey(decoded)) {
        return service.getById(Number(decoded), signal);
      }
      return service.getByNumber(decoded, signal);
    },

    async create(data: PrescriptionFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Prescription>>(
        "/admin/prescriptions",
        {
          method: "POST",
          body: buildPrescriptionFormData(data),
        },
      );
      return mapPrescriptionFromApi(response.data);
    },

    async update(id, data: Partial<PrescriptionFormData>) {
      if (data.file) {
        const formData = buildPrescriptionFormData(data);
        const { method, body } = submitMultipartFormData(formData, "PUT");
        const response = await apiRequest<LaravelSuccessResponse<Prescription>>(
          `/admin/prescriptions/${id}`,
          {
            method,
            body,
          },
        );
        return mapPrescriptionFromApi(response.data);
      }

      const response = await apiRequest<LaravelSuccessResponse<Prescription>>(
        `/admin/prescriptions/${id}`,
        {
          method: "PUT",
          body: buildPrescriptionJsonPayload(data),
        },
      );
      return mapPrescriptionFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/prescriptions/${id}`, { method: "DELETE" });
    },
  };

  return service;
}

export { createApiPrescriptionsService };
