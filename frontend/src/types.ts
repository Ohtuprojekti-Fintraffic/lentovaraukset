import type { EventInput } from '@fullcalendar/core';
import type { ReservationEntry, TimeslotEntry } from '@lentovaraukset/shared/src/index';

export type ReservationCalendarEvent = Pick<Required<EventInput>, 'id' | 'title' | 'start' | 'end'>;

export type TimeSlotsCalendarEvent = Pick<Required<EventInput>, 'id' | 'start' | 'end'>;

export function reservationEntryToCalendarEvent(re: ReservationEntry): ReservationCalendarEvent {
  return {
    id: re.id.toString(), title: re.aircraftId, start: re.start, end: re.end,
  };
}

export function timeSlotsEntryToCalendarEvent(ts: TimeslotEntry): TimeSlotsCalendarEvent {
  return {
    id: ts.id.toString(), start: ts.start, end: ts.end,
  };
}
