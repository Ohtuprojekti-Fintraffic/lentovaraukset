import React from 'react';

import Calendar from '../components/Calendar';
import {
  getTimeSlots, modifyTimeSlot, addTimeSlot, deleteTimeslot,
} from '../queries/timeSlots';

function TimeSlotCalendar() {
  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <h1 className="text-3xl">Vapaat varausikkunat</h1>
      <Calendar
        getEventsFn={getTimeSlots}
        addEventFn={addTimeSlot}
        modifyEventFn={modifyTimeSlot}
        deleteEventFn={deleteTimeslot}
        granularity={{ minutes: 20 }} // TODO: Get from airfield api
        eventColors={{ backgroundColor: '#bef264', eventColor: '#84cc16', textColor: '#000000' }}
      />
    </div>
  );
}

export default TimeSlotCalendar;
