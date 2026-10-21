import type {
  Invoice,
  InvoiceCustomer,
  InvoiceOrderItem,
  InvoicePaymentProviderRef,
  InvoiceProviderPayment,
} from "@/features/invoices/types/invoices.types";
import type { EnumLabelValue } from "@/features/orders/types/orders.types";
import {
  resolveStaticEnumLabel,
  type StaticEnumLocale,
} from "@/shared/constants/static-enum-options";
import { normalizeEnumLabelValue } from "@/shared/lib/api/normalize-enum.utils";
import { getTitleFromApiTranslations } from "@/shared/lib/api/normalize-translations.utils";

type RawProviderCard = {
  Brand?: string | null;
  Number?: string | null;
  NameOnCard?: string | null;
};

type RawProviderTransaction = {
  VatAmount?: string | number | null;
  TotalServiceCharge?: string | number | null;
  Card?: RawProviderCard | null;
  CardNumber?: string | null;
  AuthorizationId?: string | null;
  PaymentId?: string | null;
  TransactionStatus?: string | null;
  IpAddress?: string | null;
  Country?: string | null;
};

type RawProviderInvoiceItem = {
  ItemName?: string | null;
  Quantity?: number | null;
  UnitPrice?: number | null;
};

type RawProviderResponse = {
  CustomerName?: string | null;
  CustomerEmail?: string | null;
  CustomerMobile?: string | null;
  InvoiceReference?: string | null;
  InvoiceItems?: RawProviderInvoiceItem[] | null;
  focusTransaction?: RawProviderTransaction | null;
  InvoiceTransactions?: RawProviderTransaction[] | null;
};

type RawInvoice = Omit<
  Invoice,
  | "status"
  | "paymentProviderType"
  | "paymentProvider"
  | "currency"
  | "customer"
  | "items"
  | "providerPayment"
  | "taxAmount"
  | "serviceCharge"
> & {
  status?: string | EnumLabelValue | null;
  paymentProviderType?: string | EnumLabelValue | null;
  paymentProvider?: (InvoicePaymentProviderRef & { translations?: unknown }) | null;
  currency?: {
    id?: number;
    code?: string | null;
    title?: string;
    symbol?: string;
    translations?: unknown;
  } | null;
  currencyCode?: string | null;
  customer?: (InvoiceCustomer & {
    type?: string | null;
    createdBy?: string | EnumLabelValue | null;
  }) | null;
  items?: InvoiceOrderItem[] | null;
  providerTransactionId?: string | null;
  providerResponse?: RawProviderResponse | null;
};

function parseAmount(value: string | number | null | undefined): number | null {
  if (value == null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapPaymentProvider(
  provider: RawInvoice["paymentProvider"],
): InvoicePaymentProviderRef | null {
  if (!provider) return null;
  const title =
    provider.title?.trim() ||
    getTitleFromApiTranslations(provider.translations, "") ||
    undefined;

  return {
    id: provider.id,
    title,
    standard: provider.standard,
    imageFileUrl: provider.imageFileUrl,
    type: provider.type ? normalizeEnumLabelValue(provider.type) : null,
  };
}

function pickProviderTransaction(
  response: RawProviderResponse | null | undefined,
): RawProviderTransaction | null {
  if (!response) return null;
  return response.focusTransaction ?? response.InvoiceTransactions?.[0] ?? null;
}

function mapProviderPayment(
  response: RawProviderResponse | null | undefined,
): InvoiceProviderPayment | null {
  if (!response) return null;
  const tx = pickProviderTransaction(response);
  const card = tx?.Card;
  const payment: InvoiceProviderPayment = {
    vatAmount: parseAmount(tx?.VatAmount),
    serviceCharge: parseAmount(tx?.TotalServiceCharge),
    invoiceReference: response.InvoiceReference?.trim() || null,
    cardBrand: card?.Brand?.trim() || null,
    cardNumber: (tx?.CardNumber ?? card?.Number)?.trim() || null,
    nameOnCard: card?.NameOnCard?.trim() || null,
    authorizationId: tx?.AuthorizationId?.trim() || null,
    paymentId: tx?.PaymentId?.trim() || null,
    transactionStatus: tx?.TransactionStatus?.trim() || null,
    ipAddress: tx?.IpAddress?.trim() || null,
    country: tx?.Country?.trim() || null,
  };

  const hasValue = Object.values(payment).some((value) => value != null && value !== "");
  return hasValue ? payment : null;
}

function mapCustomerFromProvider(
  response: RawProviderResponse | null | undefined,
): InvoiceCustomer | null {
  if (!response) return null;
  const fullName = response.CustomerName?.trim() || null;
  const email = response.CustomerEmail?.trim() || null;
  const phoneNumber = response.CustomerMobile?.trim() || null;
  if (!fullName && !email && !phoneNumber) return null;
  return { fullName, email, phoneNumber };
}

function mapInvoiceCustomer(
  customer: RawInvoice["customer"],
): InvoiceCustomer | null {
  if (!customer) return null;

  const typeRaw = customer.type?.toLowerCase() ?? null;
  const type = typeRaw === "user" || typeRaw === "guest" ? typeRaw : null;
  const createdBy =
    normalizeEnumLabelValue(customer.createdBy) ??
    (type === "user"
      ? { value: "CUSTOMER", label: "Customer" }
      : type === "guest"
        ? { value: "GUEST", label: "Guest" }
        : null);

  return {
    type,
    userId: customer.userId ?? null,
    fullName: customer.fullName ?? null,
    email: customer.email ?? null,
    phoneNumber: customer.phoneNumber ?? null,
    isRegistered: type === "user" || Boolean(customer.userId),
    createdBy,
    createdByAdmin: customer.createdByAdmin ?? null,
  };
}

function mapItemsFromProvider(
  response: RawProviderResponse | null | undefined,
): InvoiceOrderItem[] {
  const rawItems = response?.InvoiceItems;
  if (!rawItems?.length) return [];

  return rawItems.map((item, index) => {
    const quantity = item.Quantity ?? 0;
    const price = item.UnitPrice ?? 0;
    return {
      id: -(index + 1),
      productTitle: item.ItemName?.trim() || null,
      quantity,
      price,
      subTotalPrice: quantity * price,
    };
  });
}

/** Normalizes Invoice list (slim) and Details into Admin UI shape. */
export function mapInvoiceFromApi(invoice: RawInvoice): Invoice {
  const currencyCode = invoice.currencyCode ?? invoice.currency?.code ?? null;
  const currencyTitle =
    invoice.currency?.title?.trim() ||
    getTitleFromApiTranslations(invoice.currency?.translations, "") ||
    currencyCode ||
    "";

  const providerPayment = mapProviderPayment(invoice.providerResponse);
  const rootCustomer = mapInvoiceCustomer(invoice.customer);
  const fallbackCustomer = mapCustomerFromProvider(invoice.providerResponse);
  const rootItems = invoice.items?.length ? invoice.items : null;
  const fallbackItems = mapItemsFromProvider(invoice.providerResponse);

  const { providerResponse: _providerResponse, ...rest } = invoice;

  return {
    ...rest,
    status: normalizeEnumLabelValue(invoice.status),
    paymentProviderType: normalizeEnumLabelValue(invoice.paymentProviderType),
    paymentProvider: mapPaymentProvider(invoice.paymentProvider),
    currencyCode,
    currency: invoice.currency
      ? {
          id: invoice.currency.id ?? 0,
          title: currencyTitle,
          symbol: invoice.currency.symbol ?? "",
        }
      : null,
    customer: rootCustomer ?? fallbackCustomer,
    items: rootItems ?? fallbackItems,
    itemsCount: invoice.itemsCount ?? (rootItems ?? fallbackItems).length,
    providerTransactionId: invoice.providerTransactionId ?? null,
    taxAmount: providerPayment?.vatAmount ?? null,
    serviceCharge: providerPayment?.serviceCharge ?? null,
    providerPayment,
  };
}

export function getInvoicePaymentLabel(
  invoice: Invoice,
  locale: StaticEnumLocale = "en",
): string | null {
  const title = invoice.paymentProvider?.title?.trim() || null;
  if (title) return title;

  return resolveStaticEnumLabel(
    "invoicePaymentProvider",
    invoice.paymentProviderType?.value,
    locale,
    invoice.paymentProviderType?.label,
  );
}
