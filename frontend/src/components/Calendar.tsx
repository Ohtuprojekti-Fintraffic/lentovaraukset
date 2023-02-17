import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import {
  DateSelectArg, EventChangeArg, EventClickArg, EventSourceInput,
} from '@fullcalendar/core';

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
  selectConstraint: string | undefined;
};

function Calendar({
  eventSources,
  addEventFn,
  modifyEventFn,
  deleteEventFn,
  granularity,
  eventColors,
  selectConstraint,
}: CalendarProps) {
  const calendarRef: React.RefObject<FullCalendar> = React.createRef();

  // When a event box is clicked
  const handleEventClick = async (clickData: EventClickArg) => {
    if (clickData.event.display.includes('background')) return;

    // until better confirm
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Haluatko varmasti poistaa aikaikkunan?')) {
      await deleteEventFn(Number(clickData.event.id));
    }
    calendarRef.current?.getApi().refetchEvents();
    // Open event info screen here
    // Refresh calendar if changes were made
  };

  // When a event box is moved or resized
  const handleEventChange = async (changeData: EventChangeArg) => {
    // Open confirmation popup here
    const { event } = changeData;

    await modifyEventFn({
      id: event.id,
      start: event.start || new Date(),
      end: event.end || new Date(),
    });

    calendarRef.current?.getApi().refetchEvents();
  };

  // When a new event is selected (dragged) in the calendar.
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
      selectConstraint={selectConstraint}
      eventSources={eventSources}
    />
  );
}

export default Calendar;
