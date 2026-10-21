import { useCallback, useEffect, useState } from "react";

import { customersService } from "@/features/customers/services/customers.service";
import type {
  CrmCustomer,
  CrmInvoiceStatusFilter,
  CrmOrderSlice,
  CrmPaymentSlice,
} from "@/features/customers/types/customers.types";

const SLICE_PAGE_SIZE = 10;

type UseCustomerOrdersSliceOptions = {
  customer: CrmCustomer;
};

export function useCustomerOrdersSlice({ customer }: UseCustomerOrdersSliceOptions) {
  const [items, setItems] = useState<CrmOrderSlice[]>(() => customer.orders ?? []);
  const [total, setTotal] = useState(() => customer.ordersTotal ?? customer.orders?.length ?? 0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setItems(customer.orders ?? []);
    setTotal(customer.ordersTotal ?? customer.orders?.length ?? 0);
    setPage(1);
    setError(null);
  }, [customer.id, customer.orders, customer.ordersTotal]);

  const hasMore = items.length < total;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const result = await customersService.listOrders(customer.id, {
        page: nextPage,
        limit: SLICE_PAGE_SIZE,
      });
      setItems((current) => [...current, ...result.data]);
      setTotal(result.total);
      setPage(nextPage);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error("Request failed"));
    } finally {
      setIsLoading(false);
    }
  }, [customer.id, hasMore, isLoading, page]);

  return { items, total, hasMore, isLoading, error, loadMore };
}

type UseCustomerPaymentsSliceOptions = {
  customer: CrmCustomer;
};

export function useCustomerPaymentsSlice({ customer }: UseCustomerPaymentsSliceOptions) {
  const [invoiceStatus, setInvoiceStatus] = useState<CrmInvoiceStatusFilter | "">("");
  const [items, setItems] = useState<CrmPaymentSlice[]>(() => customer.payments ?? []);
  const [total, setTotal] = useState(() => customer.paymentsTotal ?? customer.payments?.length ?? 0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPage = useCallback(
    async (nextPage: number, status: CrmInvoiceStatusFilter | "", append: boolean) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await customersService.listPayments(customer.id, {
          page: nextPage,
          limit: SLICE_PAGE_SIZE,
          invoiceStatus: status || undefined,
        });
        setItems((current) => (append ? [...current, ...result.data] : result.data));
        setTotal(result.total);
        setPage(nextPage);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError : new Error("Request failed"));
      } finally {
        setIsLoading(false);
      }
    },
    [customer.id],
  );

  useEffect(() => {
    setItems(customer.payments ?? []);
    setTotal(customer.paymentsTotal ?? customer.payments?.length ?? 0);
    setPage(1);
    setError(null);
    setInvoiceStatus("");
  }, [customer.id, customer.payments, customer.paymentsTotal]);

  useEffect(() => {
    if (invoiceStatus === "") return;
    void fetchPage(1, invoiceStatus, false);
  }, [fetchPage, invoiceStatus]);

  const setPaymentFilter = useCallback(
    (next: CrmInvoiceStatusFilter | "") => {
      setInvoiceStatus(next);
      if (next === "") {
        setItems(customer.payments ?? []);
        setTotal(customer.paymentsTotal ?? customer.payments?.length ?? 0);
        setPage(1);
        setError(null);
        return;
      }
    },
    [customer.payments, customer.paymentsTotal],
  );

  const hasMore = items.length < total;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    await fetchPage(page + 1, invoiceStatus, true);
  }, [fetchPage, hasMore, invoiceStatus, isLoading, page]);

  return {
    items,
    total,
    invoiceStatus,
    setPaymentFilter,
    hasMore,
    isLoading,
    error,
    loadMore,
  };
}

export { SLICE_PAGE_SIZE };
