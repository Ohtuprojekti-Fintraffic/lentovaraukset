import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';

import interactionPlugin from '@fullcalendar/interaction';
import {
  DateSelectArg, EventChangeArg, EventClickArg, EventSourceInput,
} from '@fullcalendar/core';
import {
  getTimeSlots, modifyTimeSlot, addTimeSlot, deleteTimeslot,
} from '../queries/timeSlots';

function TimeSlotCalendar() {
  const granularity = { minutes: 20 }; // TODO: Get from airfield api

  const calendarRef: React.RefObject<FullCalendar> = React.createRef();

  const getTimeSlotEvents: EventSourceInput = async (info, successCallback, failureCallback) => {
    try {
      const timeSlots = await getTimeSlots(info.start, info.end);
      successCallback(timeSlots);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  // When a timeslot box is clicked
  const handleTimeSlotClick = async (clickData: EventClickArg) => {
    // until better confirm
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Haluatko varmasti poistaa aikaikkunan?')) {
      await deleteTimeslot(Number(clickData.event.id));
    }
    calendarRef.current?.getApi().refetchEvents();
    // Open time slot info screen here
    // Refresh calendar if changes were made
  };

  // When a timeslot box is moved or resized
  const handleTimeSlotChange = async (changeData: EventChangeArg) => {
    // Open confirmation popup here
    const timeSlot = changeData.event;

    await modifyTimeSlot({
      id: timeSlot.id,
      start: timeSlot.start || new Date(),
      end: timeSlot.end || new Date(),
    });

    calendarRef.current?.getApi().refetchEvents();
  };

  // When a new timeslot is selected (dragged) in the calendar.
  const handleTimeSlotCreate = async (dropData: DateSelectArg) => {
    await addTimeSlot({
      start: dropData.start,
      end: dropData.end,
    });
    const calendar = calendarRef.current?.getApi();
    calendar?.refetchEvents();
    calendar?.unselect();
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <h1 className="text-3xl">Vapaat varausikkunat</h1>
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin]}
        locale="fi"
        weekNumberCalculation="ISO"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek',
        }}
        height="100%"
        initialView="timeGridWeek"
        allDaySlot={false}
        nowIndicator
        scrollTime="08:00:00"
        dayHeaderFormat={{ weekday: 'long' }}
        slotDuration={granularity}
        snapDuration={granularity}
        slotLabelInterval={{ minutes: 30 }}
        slotLabelFormat={{
          hour: 'numeric', minute: '2-digit', hour12: false, meridiem: false,
        }}
        selectable
        selectMirror
        unselectAuto={false}
        editable
        eventResizableFromStart
        eventStartEditable
        eventOverlap={false}
        eventBackgroundColor="#bef264"
        eventColor="#84cc16"
        eventTextColor="#000000"
        eventClick={handleTimeSlotClick}
        eventChange={handleTimeSlotChange}
        select={handleTimeSlotCreate}
        events={getTimeSlotEvents}
      />
    </div>
  );
}

export default TimeSlotCalendar;
