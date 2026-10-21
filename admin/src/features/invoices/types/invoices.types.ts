import type { EnumLabelValue, OrderUserRef } from "@/features/orders/types/orders.types";
import type { PaginatedResult } from "@/shared/types";

export type InvoicePaymentProviderRef = {
  id: number;
  title?: string;
  standard?: boolean;
  imageFileUrl?: string | null;
  type?: EnumLabelValue | null;
  /** Slim list shape: EN/AR titles only. */
  translations?: Partial<Record<"en" | "ar", { title?: string }>>;
};

export type InvoicePdfDownload = {
  fileName: string;
  fileUrl: string;
  downloadUrl: string;
};

export type InvoiceCustomer = {
  /** Slim list: `user` = registered account, `guest` = checkout contact on the order. */
  type?: "user" | "guest" | null;
  userId?: number | null;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  isRegistered?: boolean;
  createdBy?: EnumLabelValue | null;
  createdByAdmin?: OrderUserRef | null;
};

export type InvoiceOrderItem = {
  id: number;
  productId?: number | null;
  productTitle?: string | null;
  quantity: number;
  price: number;
  subTotalPrice: number;
};

/** Normalized gateway payment details (MyFatoorah focusTransaction / InvoiceTransactions). */
export type InvoiceProviderPayment = {
  vatAmount?: number | null;
  serviceCharge?: number | null;
  invoiceReference?: string | null;
  cardBrand?: string | null;
  cardNumber?: string | null;
  nameOnCard?: string | null;
  authorizationId?: string | null;
  paymentId?: string | null;
  transactionStatus?: string | null;
  ipAddress?: string | null;
  country?: string | null;
};

export type Invoice = {
  id: number;
  invoiceNumber?: string | null;
  orderId?: number;
  orderRefNumber?: string | null;
  customer?: InvoiceCustomer | null;
  itemsCount?: number;
  items?: InvoiceOrderItem[];
  paymentProviderId?: number | null;
  currencyId?: number | null;
  currencyCode?: string | null;
  currency?: {
    id: number;
    title: string;
    symbol: string;
  } | null;
  status?: EnumLabelValue | null;
  /** Checkout method enum (CASH_ON_DELIVERY / MYFATOORAH / HESABE). */
  paymentProviderType?: EnumLabelValue | null;
  /** Linked payment provider record, when configured. */
  paymentProvider?: InvoicePaymentProviderRef | null;
  totalPrice: number;
  paymentMethod?: string | null;
  paidAt?: string | null;
  providerInvoiceId?: string | null;
  providerTransactionId?: string | null;
  paymentUrl?: string | null;
  /** VAT / tax from provider transaction when available. */
  taxAmount?: number | null;
  /** Provider service charge when available. */
  serviceCharge?: number | null;
  providerPayment?: InvoiceProviderPayment | null;
  createdAt?: string;
  updatedAt?: string;
};

export type InvoiceListParams = {
  page?: number;
  limit?: number;
  search?: string;
  orderId?: number;
  orderRefNumber?: string;
  invoiceNumber?: string;
  status?: string;
  paymentProvider?: string;
  currencyCode?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

export type InvoiceListResult = PaginatedResult<Invoice>;
