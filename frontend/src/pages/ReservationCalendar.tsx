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
  const getEvents = async (start: Date, end: Date) => {
    const reservations = await getReservations(start, end);
    const timeSlots = await getTimeSlots(start, end);
    return reservations.concat(timeSlots?.length
      ? timeSlots!.map((timeSlot) => ({
        ...timeSlot, groupId: 'timeslots', display: 'inverse-background', color: '#2C2C44',
      }))
      : [{
        title: 'ei varattavissa', start, end, display: 'background', color: '#2C2C44',
      }]);
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <h1 className="text-3xl">Varauskalenteri</h1>
      <Calendar
        getEventsFn={getEvents}
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
