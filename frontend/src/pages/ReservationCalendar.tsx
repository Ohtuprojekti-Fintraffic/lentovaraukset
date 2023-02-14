import React from 'react';

import Calendar from '../components/Calendar';
import {
  getReservations,
  addReservation,
  modifyReservation,
  deleteReservation,
} from '../queries/reservations';

function ReservationCalendar() {
  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <h1 className="text-3xl">Varauskalenteri</h1>
      <Calendar
        getEventsFn={getReservations}
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
