import type {
  Invoice,
  InvoiceListParams,
  InvoiceListResult,
  InvoicePdfDownload,
} from "@/features/invoices/types/invoices.types";

export interface InvoicesService {
  list(params?: InvoiceListParams, signal?: AbortSignal): Promise<InvoiceListResult>;
  getById(id: number): Promise<Invoice>;
  downloadPdf(invoiceNumber: string): Promise<InvoicePdfDownload>;
}
