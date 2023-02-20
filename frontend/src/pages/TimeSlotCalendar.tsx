import { EventSourceFunc } from '@fullcalendar/core';
import React from 'react';

import Calendar from '../components/Calendar';
import {
  getTimeSlots, modifyTimeSlot, addTimeSlot, deleteTimeslot,
} from '../queries/timeSlots';

function TimeSlotCalendar() {
  const timeSlotsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const timeslots = await getTimeSlots(start, end);
      successCallback(timeslots);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  const clickEventFn = async (event: { id: string }): Promise<void> => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Haluatko varmasti poistaa aikaikkunan?')) {
      await deleteTimeslot(Number(event.id));
    }
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <h1 className="text-3xl">Vapaat varausikkunat</h1>
      <Calendar
        eventSources={[timeSlotsSourceFn]}
        addEventFn={addTimeSlot}
        modifyEventFn={modifyTimeSlot}
        clickEventFn={clickEventFn}
        granularity={{ minutes: 20 }} // TODO: Get from airfield api
        eventColors={{ backgroundColor: '#bef264', eventColor: '#84cc16', textColor: '#000000' }}
        selectConstraint={undefined}
      />
    </div>
  );
}

export default TimeSlotCalendar;
