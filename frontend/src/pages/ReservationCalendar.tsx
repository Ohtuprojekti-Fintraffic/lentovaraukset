import { EventSourceFunc } from '@fullcalendar/core';
import React from 'react';

import Calendar from '../components/Calendar';
import {
  getReservations,
  addReservation,
  modifyReservation,
  deleteReservation,
} from '../queries/reservations';
import { getTimeSlots } from '../queries/timeSlots';

function ReservationCalendar() {
  const reservationsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const reservations = await getReservations(start, end);
      successCallback(reservations);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  const timeSlotsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const timeslots = await getTimeSlots(start, end);
      const timeslotsMapped = timeslots.map((timeSlot) => ({
        ...timeSlot, groupId: 'timeslots', display: 'inverse-background', color: '#2C2C44',
      }));

      const notReservable = [{
        title: 'ei varattavissa', start, end, display: 'background', color: '#2C2C44', overlap: false,
      }];

      successCallback(timeslotsMapped.length ? timeslotsMapped : notReservable);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <h1 className="text-3xl">Varauskalenteri</h1>
      <Calendar
        eventSources={[reservationsSourceFn, timeSlotsSourceFn]}
        addEventFn={addReservation}
        modifyEventFn={modifyReservation}
        deleteEventFn={deleteReservation}
        granularity={{ minutes: 20 }} // TODO: Get from airfield api
        eventColors={{ backgroundColor: '#000000', eventColor: '#FFFFFFF', textColor: '#FFFFFF' }}
      />
    </div>
  );
}

export default ReservationCalendar;
