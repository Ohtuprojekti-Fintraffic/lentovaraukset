import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import {
  AllowFunc, DateSelectArg, EventChangeArg, EventClickArg, EventSourceInput,
} from '@fullcalendar/core';
import countMostConcurrent from '@lentovaraukset/shared/src/overlap';

type CalendarProps = {
  calendarRef?: React.RefObject<FullCalendar>;
  eventSources: EventSourceInput[];
  addEventFn: (event: { start: Date; end: Date }) => Promise<void>;
  modifyEventFn: (event: { id: string; start: Date; end: Date }) => Promise<void>;
  clickEventFn: (event: {
    id: string;
    start?: Date;
    end?: Date;
    title?: string }) => Promise<void>;
  granularity: { minutes: number };
  eventColors: {
    backgroundColor?: string;
    eventColor?: string;
    textColor?: string;
  } | undefined;
  selectConstraint: string | undefined;
  maxConcurrentLimit?: number;
};

function Calendar({
  calendarRef = React.createRef(),
  eventSources,
  addEventFn,
  modifyEventFn,
  clickEventFn,
  granularity,
  eventColors,
  selectConstraint,
  maxConcurrentLimit = 1,
}: CalendarProps) {
  const allowEvent: AllowFunc = (span, movingEvent) => {
    const events = calendarRef.current?.getApi().getEvents().filter(
      (e) => e.id !== movingEvent?.id
        && e.start && e.end
        && !e.display.includes('background')
        && e.start < span.end && e.end > span.start,
    );

    console.log(events);
    return events
      ? countMostConcurrent(events as { start: Date, end: Date }[]) < maxConcurrentLimit
      : true;
  };

  // When a event box is clicked
  const handleEventClick = async (clickData: EventClickArg) => {
    if (clickData.event.display.includes('background')) return;

    const { event } = clickData;

    await clickEventFn({
      id: event.id,
      start: event.start || undefined,
      end: event.start || undefined,
      title: event.title,
    });

    // Refresh calendar if changes were made
    calendarRef.current?.getApi().refetchEvents();
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
      slotEventOverlap={false}
      selectAllow={allowEvent}
      eventAllow={allowEvent}
    />
  );
}

export default Calendar;
