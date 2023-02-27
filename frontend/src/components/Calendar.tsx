import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import {
  AllowFunc, DateSelectArg, EventChangeArg, EventClickArg, EventRemoveArg, EventSourceInput,
} from '@fullcalendar/core';
import countMostConcurrent from '@lentovaraukset/shared/src/overlap';
import { EventImpl } from '@fullcalendar/core/internal';

type CalendarProps = {
  eventSources: EventSourceInput[];
  addEventFn: (event: { start: Date; end: Date }) => Promise<void>;
  modifyEventFn: (event: { id: string; start: Date; end: Date }) => Promise<void>;
  clickEventFn: (event: EventImpl) => Promise<void>;
  removeEventFn: (event: EventRemoveArg) => Promise<void>;
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
  eventSources,
  addEventFn,
  modifyEventFn,
  clickEventFn,
  removeEventFn,
  granularity,
  eventColors,
  selectConstraint,
  maxConcurrentLimit = 1,
}: CalendarProps) {
  const calendarRef: React.RefObject<FullCalendar> = React.createRef();

  const allowEvent: AllowFunc = (span, movingEvent) => {
    const events = calendarRef.current?.getApi().getEvents().filter(
      (e) => e.id !== movingEvent?.id
        && e.start && e.end
        && !e.display.includes('background')
        && e.start < span.end && e.end > span.start,
    );

    if (span.start < new Date()) {
      return false;
    }

    console.log(events);
    return events
      ? countMostConcurrent(events as { start: Date, end: Date }[]) < maxConcurrentLimit
      : true;
  };

  // When a event box is clicked
  const handleEventClick = async (clickData: EventClickArg) => {
    if (clickData.event.display.includes('background')) return;
    const { event } = clickData;
    await clickEventFn(event);
  };

  // When a event box is moved or resized
  const handleEventChange = async (changeData: EventChangeArg) => {
    // Open confirmation popup here
    const { event } = changeData;

    const eventStartTime: Date = event.start || new Date();
    const currentTime: Date = new Date();

    if (eventStartTime >= currentTime) {
      await modifyEventFn({
        id: event.id,
        start: event.start || new Date(),
        end: event.end || new Date(),
      });
    }
    calendarRef.current?.getApi().refetchEvents();
  };

  // When a new event is selected (dragged) in the calendar.
  const handleEventCreate = async (dropData: DateSelectArg) => {
    const newStartTime: Date = dropData.start || new Date();
    const currentTime: Date = new Date();

    if (newStartTime < currentTime) {
      calendarRef.current?.getApi().unselect();
      return;
    }

    await addEventFn({
      start: dropData.start,
      end: dropData.end,
    });
    calendarRef.current?.getApi().refetchEvents();
    calendarRef.current?.getApi().unselect();
  };

  const handleEventRemove = async (removeInfo: EventRemoveArg) => {
    await removeEventFn(removeInfo);
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
      eventRemove={handleEventRemove}
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
