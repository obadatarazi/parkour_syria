import type { EventsService } from "@/features/events/services/events.service.types";
import { createApiEventsService } from "@/features/events/services/events-api.service";

export const eventsService: EventsService = createApiEventsService();
