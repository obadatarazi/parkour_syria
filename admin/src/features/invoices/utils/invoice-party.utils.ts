import type { Invoice } from "@/features/invoices/types/invoices.types";
import type { OrderPartyDisplay } from "@/features/orders/utils/order-customer-display";

export function mapInvoiceCustomerToParty(invoice: Invoice): OrderPartyDisplay {
  const customer = invoice.customer;
  return {
    fullName: customer?.fullName,
    email: customer?.email,
    phoneNumber: customer?.phoneNumber,
    userId: customer?.userId,
    createdBy: customer?.createdBy,
    createdByAdmin: customer?.createdByAdmin,
  };
}
