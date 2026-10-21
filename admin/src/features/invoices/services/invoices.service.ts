import type { InvoicesService } from "@/features/invoices/services/invoices.service.types";
import { createApiInvoicesService } from "@/features/invoices/services/invoices-api.service";

export const invoicesService: InvoicesService = createApiInvoicesService();
