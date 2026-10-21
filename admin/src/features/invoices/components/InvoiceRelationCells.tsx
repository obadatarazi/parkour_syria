import { Link } from "react-router";

import type { Invoice } from "@/features/invoices/types/invoices.types";
import { invoiceOrderSearchHref } from "@/features/invoices/utils/invoice-links";
import { OrderCustomerCell } from "@/features/orders/components/OrderCustomerCell";
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

type InvoiceCustomerCellProps = {
  invoice: Invoice;
};

export function InvoiceCustomerCell({ invoice }: InvoiceCustomerCellProps) {
  return <OrderCustomerCell party={mapInvoiceCustomerToParty(invoice)} />;
}

type InvoiceOrderCellProps = {
  invoice: Invoice;
};

export function InvoiceOrderCell({ invoice }: InvoiceOrderCellProps) {
  const label =
    invoice.orderRefNumber || (invoice.orderId ? `#${invoice.orderId}` : "—");
  const href = invoiceOrderSearchHref(invoice);

  if (!href || label === "—") {
    return <span className="font-mono text-xs text-muted-foreground">{label}</span>;
  }

  return (
    <Link
      to={href}
      className="font-mono text-xs font-medium text-brand hover:underline"
      onClick={(event) => event.stopPropagation()}
    >
      {label}
    </Link>
  );
}
