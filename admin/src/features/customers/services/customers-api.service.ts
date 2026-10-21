import type { CustomersService } from "@/features/customers/services/customers.service.types";
import type {
  CrmAssignCouponInput,
  CrmCustomer,
  CrmSendNotificationInput,
  CrmStaffNote,
  CrmStaffNoteInput,
} from "@/features/customers/types/customers.types";
import {
  mapCustomerFromApi,
  mapOrdersFromApi,
  mapPaymentsFromApi,
  mapStaffNoteFromApi,
} from "@/features/customers/utils/map-customer-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  mapPaginatedFromApi,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
} from "@/shared/lib/api";

function createApiCustomersService(): CustomersService {
  return {
    async list(params = {}, signal) {
      const response = await apiRequest<LaravelPaginatedResponse<unknown>>("/admin/customers", {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            segment: params.segment,
            tag: params.tag,
            status: params.status,
            carePlan: params.carePlan,
            sort: params.sort,
            direction: params.direction,
          },
          { limit: 10 },
        ),
      });
      return mapPaginatedFromApi(
        response as LaravelPaginatedResponse<CrmCustomer>,
        mapCustomerFromApi,
      );
    },

    async getById(id, signal) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(`/admin/customers/${id}`, {
        signal,
      });
      return mapCustomerFromApi(response.data);
    },

    async update(id, data) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(`/admin/customers/${id}`, {
        method: "PUT",
        body: {
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          whatsappPhoneNumber: data.whatsappPhoneNumber,
          whatsappNotificationsEnabled: data.whatsappNotificationsEnabled,
          active: data.active,
        },
      });
      return mapCustomerFromApi(response.data);
    },

    async listOrders(customerId, params = {}, signal) {
      const response = await apiRequest<
        LaravelSuccessResponse<{
          items: unknown[];
          total: number;
          page: number;
          pageSize: number;
        }>
      >(`/admin/customers/${customerId}/orders`, {
        signal,
        params: buildLaravelListParams(
          { page: params.page, limit: params.limit },
          { limit: 10 },
        ),
      });
      const payload = response.data;

      return {
        data: mapOrdersFromApi(payload.items),
        total: payload.total,
        page: payload.page,
        pageSize: payload.pageSize,
      };
    },

    async listPayments(customerId, params = {}, signal) {
      const response = await apiRequest<
        LaravelSuccessResponse<{
          items: unknown[];
          total: number;
          page: number;
          pageSize: number;
        }>
      >(`/admin/customers/${customerId}/payments`, {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            invoiceStatus: params.invoiceStatus,
          },
          { limit: 10 },
        ),
      });
      const payload = response.data;

      return {
        data: mapPaymentsFromApi(payload.items),
        total: payload.total,
        page: payload.page,
        pageSize: payload.pageSize,
      };
    },

    async getStats(signal) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>("/admin/customers/stats", {
        signal,
      });
      return response.data as Awaited<ReturnType<CustomersService["getStats"]>>;
    },

    async getReport(signal) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(
        "/admin/customers/report",
        { signal },
      );
      return response.data as Awaited<ReturnType<CustomersService["getReport"]>>;
    },

    async toggleVip(id) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(
        `/admin/customers/${id}/toggle-vip`,
        { method: "POST" },
      );
      return mapCustomerFromApi(response.data);
    },

    async assignCoupon(id, data: CrmAssignCouponInput) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(
        `/admin/customers/${id}/assign-coupon`,
        {
          method: "POST",
          body: { couponId: data.couponId },
        },
      );
      return mapCustomerFromApi(response.data);
    },

    async sendNotification(id, data: CrmSendNotificationInput) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(
        `/admin/customers/${id}/send-notification`,
        {
          method: "POST",
          body: data,
        },
      );
      return mapCustomerFromApi(response.data);
    },

    async pauseCarePlan(id) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(
        `/admin/customers/${id}/care-plan/pause`,
        { method: "POST" },
      );
      return mapCustomerFromApi(response.data);
    },

    async resumeCarePlan(id) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(
        `/admin/customers/${id}/care-plan/resume`,
        { method: "POST" },
      );
      return mapCustomerFromApi(response.data);
    },

    async listStaffNotes(customerId, params = {}, signal) {
      const response = await apiRequest<LaravelPaginatedResponse<unknown>>(
        `/admin/customers/${customerId}/staff-notes`,
        {
          signal,
          params: buildLaravelListParams(
            { page: params.page, limit: params.limit },
            { limit: 20 },
          ),
        },
      );
      return mapPaginatedFromApi(
        response as LaravelPaginatedResponse<CrmStaffNote>,
        mapStaffNoteFromApi,
      );
    },

    async createStaffNote(customerId, data: CrmStaffNoteInput) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(
        `/admin/customers/${customerId}/staff-notes`,
        {
          method: "POST",
          body: data,
        },
      );
      return mapStaffNoteFromApi(response.data);
    },

    async updateStaffNote(customerId, noteId, data) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(
        `/admin/customers/${customerId}/staff-notes/${noteId}`,
        {
          method: "PUT",
          body: data,
        },
      );
      return mapStaffNoteFromApi(response.data);
    },

    async deleteStaffNote(customerId, noteId) {
      const response = await apiRequest<LaravelSuccessResponse<unknown>>(
        `/admin/customers/${customerId}/staff-notes/${noteId}`,
        { method: "DELETE" },
      );
      return mapStaffNoteFromApi(response.data);
    },
  };
}

export { createApiCustomersService };
