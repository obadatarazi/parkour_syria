import type {
  CrmAssignCouponInput,
  CrmCustomer,
  CrmCustomerListParams,
  CrmCustomerSliceParams,
  CrmOrderSlice,
  CrmPaymentSlice,
  CrmProfileInput,
  CrmReport,
  CrmSendNotificationInput,
  CrmStaffNote,
  CrmStaffNoteInput,
  CrmStats,
} from "@/features/customers/types/customers.types";
import type { PaginatedResult } from "@/shared/types";

export type CustomersService = {
  list(params?: CrmCustomerListParams, signal?: AbortSignal): Promise<PaginatedResult<CrmCustomer>>;
  getById(id: number, signal?: AbortSignal): Promise<CrmCustomer>;
  update(id: number, data: Partial<CrmProfileInput>): Promise<CrmCustomer>;
  listOrders(
    customerId: number,
    params?: CrmCustomerSliceParams,
    signal?: AbortSignal,
  ): Promise<PaginatedResult<CrmOrderSlice>>;
  listPayments(
    customerId: number,
    params?: CrmCustomerSliceParams,
    signal?: AbortSignal,
  ): Promise<PaginatedResult<CrmPaymentSlice>>;
  getStats(signal?: AbortSignal): Promise<CrmStats>;
  getReport(signal?: AbortSignal): Promise<CrmReport>;
  toggleVip(id: number): Promise<CrmCustomer>;
  assignCoupon(id: number, data: CrmAssignCouponInput): Promise<CrmCustomer>;
  sendNotification(id: number, data: CrmSendNotificationInput): Promise<CrmCustomer>;
  pauseCarePlan(id: number): Promise<CrmCustomer>;
  resumeCarePlan(id: number): Promise<CrmCustomer>;
  listStaffNotes(
    customerId: number,
    params?: { page?: number; limit?: number },
    signal?: AbortSignal,
  ): Promise<PaginatedResult<CrmStaffNote>>;
  createStaffNote(customerId: number, data: CrmStaffNoteInput): Promise<CrmStaffNote>;
  updateStaffNote(
    customerId: number,
    noteId: number,
    data: Partial<CrmStaffNoteInput>,
  ): Promise<CrmStaffNote>;
  deleteStaffNote(customerId: number, noteId: number): Promise<CrmStaffNote>;
};
