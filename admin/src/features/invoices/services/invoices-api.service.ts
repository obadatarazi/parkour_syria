import type { InvoicesService } from "@/features/invoices/services/invoices.service.types";
import type {
  Invoice,
  InvoiceListParams,
  InvoicePdfDownload,
} from "@/features/invoices/types/invoices.types";
import { mapInvoiceFromApi } from "@/features/invoices/utils/map-invoice-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapLaravelPagination,
} from "@/shared/lib/api";

function createApiInvoicesService(): InvoicesService {
  return {
    async list(params: InvoiceListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Invoice>>("/admin/invoices", {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            orderId: params.orderId,
            orderRefNumber: params.orderRefNumber,
            invoiceNumber: params.invoiceNumber,
            status: params.status,
            paymentProvider: params.paymentProvider,
            currencyCode: params.currencyCode,
            sort: params.sort,
            direction: params.direction,
          },
          { limit: 20 },
        ),
      });
      const page = mapLaravelPagination(response);
      return { ...page, data: page.data.map(mapInvoiceFromApi) };
    },

    async getById(id) {
      const response = await apiRequest<LaravelSuccessResponse<Invoice>>(
        `/admin/invoices/${id}`,
      );
      return mapInvoiceFromApi(response.data);
    },

    async downloadPdf(invoiceNumber) {
      const response = await apiRequest<LaravelSuccessResponse<InvoicePdfDownload>>(
        `/admin/invoices/${encodeURIComponent(invoiceNumber)}/pdf`,
      );
      return response.data;
    },
  };
}

export { createApiInvoicesService };
