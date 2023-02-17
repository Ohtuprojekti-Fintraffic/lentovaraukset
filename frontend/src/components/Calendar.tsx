import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import {
  DateSelectArg, EventChangeArg, EventClickArg, EventSourceInput, OverlapFunc,
} from '@fullcalendar/core';
import { EventImpl } from '@fullcalendar/core/internal';

type CalendarProps = {
  eventSources: EventSourceInput[];
  addEventFn: (event: { start: Date; end: Date }) => Promise<void>;
  modifyEventFn: (event: { id: string; start: Date; end: Date }) => Promise<void>;
  deleteEventFn: (id: number) => Promise<string>;
  granularity: { minutes: number };
  eventColors: {
    backgroundColor?: string;
    eventColor?: string;
    textColor?: string;
  } | undefined;
};

function Calendar({
  eventSources, addEventFn, modifyEventFn, deleteEventFn, granularity, eventColors,
}: CalendarProps) {
  const calendarRef: React.RefObject<FullCalendar> = React.createRef();

  const isOverlap = (eventA: EventImpl, eventB: EventImpl) => {
    if (eventA.start && eventA.end && eventB.start && eventB.end) {
      return !(eventA.end <= eventB.start || eventB.end <= eventA.start);
    }
    return false;
  };
  const areEventsColliding: OverlapFunc = (
    stillEvent: EventImpl,
    movingEvent: EventImpl | null,
  ) => {
    if (movingEvent === null) return true;
    if (stillEvent.groupId === 'timeslots') return true;
    // TODO: allow overlapping reservations based on airfield maxConcurrentFlights
    return !(isOverlap(stillEvent, movingEvent) || isOverlap(movingEvent, stillEvent));
  };

  // When a event box is clicked
  const handleEventClick = async (clickData: EventClickArg) => {
    // until better confirm
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Haluatko varmasti poistaa aikaikkunan?')) {
      await deleteEventFn(Number(clickData.event.id));
    }
    calendarRef.current?.getApi().refetchEvents();
    // Open event info screen here
    // Refresh calendar if changes were made
  };

  // When a timeslot box is moved or resized
  const handleEventChange = async (changeData: EventChangeArg) => {
    // Open confirmation popup here
    const timeSlot = changeData.event;

    await modifyEventFn({
      id: timeSlot.id,
      start: timeSlot.start || new Date(),
      end: timeSlot.end || new Date(),
    });

    calendarRef.current?.getApi().refetchEvents();
  };

  // When a new timeslot is selected (dragged) in the calendar.
  const handleEventCreate = async (dropData: DateSelectArg) => {
    await addEventFn({
      start: dropData.start,
      end: dropData.end,
    });

    calendarRef.current?.getApi().refetchEvents();
    calendarRef.current?.getApi().unselect();
  };

  return (
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
      editable
      eventResizableFromStart
      eventStartEditable
      eventBackgroundColor={eventColors?.backgroundColor || '#FFFFFF'}
      eventColor={eventColors?.eventColor || '#000000'}
      eventTextColor={eventColors?.textColor || '#000000'}
      eventClick={handleEventClick}
      eventChange={handleEventChange}
      select={handleEventCreate}
      eventSources={eventSources}
      eventOverlap={areEventsColliding}
    />
  );
}

export default Calendar;
