import type {
  ContactUsFormData,
  ContactUsListParams,
  ContactUsListResult,
  ContactUsMessage,
} from "@/features/contact-us/types/contact-us.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export type ContactUsService = {
  list: (params?: ContactUsListParams, signal?: AbortSignal) => Promise<ContactUsListResult>;
  getById: (id: number) => Promise<ContactUsMessage>;
  update: (id: number, data: Partial<ContactUsFormData>) => Promise<ContactUsMessage>;
  delete: (id: number) => Promise<void>;
  bulkDelete: (ids: Array<string | number>) => Promise<BulkDeleteApiResult>;
};
