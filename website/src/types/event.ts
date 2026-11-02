export type EventTypeId = 'workshop' | 'gathering';

/** Localized event as pages render it. */
export interface ParkourEvent {
  id: string;
  typeId: EventTypeId;
  startsAt: string;
  whatsapp: string;
  image: string;
  type: string;
  date: string;
  title: string;
  location: string;
}
