import { EventRemoveArg, EventSourceFunc } from '@fullcalendar/core';
import { EventImpl } from '@fullcalendar/core/internal';
import React from 'react';
import Calendar from '../components/Calendar';
import useAirfield from '../queries/airfields';
import {
  getReservations,
} from '../queries/reservations';
import {
  getTimeSlots, modifyTimeSlot, addTimeSlot, deleteTimeslot,
} from '../queries/timeSlots';

function TimeSlotCalendar() {
  const { data: airfield } = useAirfield(1); // TODO: get id from airfield selection

  const timeSlotsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const timeslots = await getTimeSlots(start, end);
      const timeslotsMapped = timeslots.map((timeslot) => ({
        ...timeslot, color: '#84cc1680',
      }));
      successCallback(timeslotsMapped);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  const reservationsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const reservations = await getReservations(start, end);

      const reservationsMapped = reservations.map((reservation) => ({
        ...reservation, id: reservation.id.toString(), groupId: 'reservations', display: 'background', color: '#000000',
      }));

      successCallback(reservationsMapped);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  const clickEventFn = async (event: EventImpl): Promise<void> => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Haluatko varmasti poistaa aikaikkunan?')) { // TODO: Replace with modal, example in ReservationCalendar
      event.remove();
    }
  };

  const removeTimeSlot = async (removeInfo: EventRemoveArg) => {
    const { event } = removeInfo;
    await deleteTimeslot(Number(event.id));
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <h1 className="text-3xl">Vapaat varausikkunat</h1>
      <Calendar
        eventSources={[timeSlotsSourceFn, reservationsSourceFn]}
        addEventFn={addTimeSlot}
        modifyEventFn={modifyTimeSlot}
        clickEventFn={clickEventFn}
        removeEventFn={removeTimeSlot}
        granularity={airfield && { minutes: airfield.eventGranularityMinutes }}
        eventColors={{ backgroundColor: '#bef264', eventColor: '#84cc1680', textColor: '#000000' }}
        selectConstraint={undefined}
        maxConcurrentLimit={1}
      />
    </div>
  );
}

export default TimeSlotCalendar;
