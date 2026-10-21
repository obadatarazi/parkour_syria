import type {
  PageFormData,
  PageListParams,
  PageListResult,
  SitePage,
} from "@/features/pages/types/pages.types";

/** Pages are fixed: the API only lists, shows and updates them. */
export interface PagesService {
  list(params?: PageListParams, signal?: AbortSignal): Promise<PageListResult>;
  getById(id: number): Promise<SitePage>;
  update(id: number, data: Partial<PageFormData>): Promise<SitePage>;
}
