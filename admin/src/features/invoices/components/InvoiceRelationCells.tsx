import { Link } from "react-router";

import type { Invoice } from "@/features/invoices/types/invoices.types";
import { invoiceOrderSearchHref } from "@/features/invoices/utils/invoice-links";
import { mapInvoiceCustomerToParty } from "@/features/invoices/utils/invoice-party.utils";
import { OrderCustomerCell } from "@/features/orders/components/OrderCustomerCell";

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
