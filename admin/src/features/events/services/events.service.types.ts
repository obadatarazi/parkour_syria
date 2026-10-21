import type {
  EventFormData,
  EventListParams,
  EventListResult,
  ParkourEvent,
} from "@/features/events/types/events.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface EventsService {
  list(params?: EventListParams, signal?: AbortSignal): Promise<EventListResult>;
  getById(id: number): Promise<ParkourEvent>;
  create(data: EventFormData): Promise<ParkourEvent>;
  update(id: number, data: Partial<EventFormData>): Promise<ParkourEvent>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
