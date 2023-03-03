import type { EventInput } from '@fullcalendar/core';
import type { ReservationEntry, TimeslotEntry } from '@lentovaraukset/shared/src/index';

export type ReservationCalendarEvent = Pick<Required<EventInput>, 'id' | 'title' | 'start' | 'end'> & EventInput;

export type TimeslotCalendarEvent = Pick<Required<EventInput>, 'id' | 'start' | 'end'> & EventInput;

export function reservationEntryToCalendarEvent(
  reservation: ReservationEntry,
  eventInputArgs: Partial<EventInput>,
): ReservationCalendarEvent {
  return {
    id: reservation.id.toString(),
    title: reservation.aircraftId,
    start: reservation.start,
    end: reservation.end,
    extendedProps: {
      user: reservation.user,
      aircraftId: reservation.aircraftId,
      phone: reservation.phone,
      email: reservation.email,
      info: reservation.info,
    },
    ...eventInputArgs,
  };
}

export function timeslotEntryToCalendarEvent(
  timeslot: TimeslotEntry,
  eventInputArgs: Partial<EventInput>,
): TimeslotCalendarEvent {
  return {
    id: timeslot.id.toString(),
    start: timeslot.start,
    end: timeslot.end,
    ...eventInputArgs,
  };
}
