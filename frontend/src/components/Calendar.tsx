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
import { isTimeInPast } from '@lentovaraukset/shared/src/validation/validation';

type CalendarProps = {
  calendarRef?: React.RefObject<FullCalendar>
  eventSources: EventSourceInput[];
  addEventFn: (event: { start: Date; end: Date; }) => Promise<any>;
  modifyEventFn: (event: {
    id: string;
    start: Date;
    end: Date,
    extendedProps: any }) => Promise<any>;
  clickEventFn: (event: EventImpl) => Promise<void>;
  removeEventFn: (event: EventRemoveArg) => Promise<void>;
  granularity: { minutes: number } | undefined;
  eventColors: {
    backgroundColor?: string;
    eventColor?: string;
    textColor?: string;
  } | undefined;
  selectConstraint: string | undefined;
  maxConcurrentLimit?: number;
  allowEventRef?: AllowFunc;
};

function Calendar({
  calendarRef: forwardedCalendarRef,
  eventSources,
  addEventFn,
  modifyEventFn,
  clickEventFn,
  removeEventFn,
  granularity = { minutes: 20 },
  eventColors,
  selectConstraint,
  maxConcurrentLimit = 1,
  allowEventRef = () => true,
}: CalendarProps) {
  const calendarRef = forwardedCalendarRef || React.createRef();

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

    if (!isTimeInPast(event.start || new Date())) {
      await modifyEventFn({
        id: event.id,
        start: event.start || new Date(),
        end: event.end || new Date(),
        extendedProps: event.extendedProps,
      });
    }
    calendarRef.current?.getApi().refetchEvents();
  };

  // When a new event is selected (dragged) in the calendar.
  const handleEventCreate = async (dropData: DateSelectArg) => {
    const newStartTime: Date = dropData.start || new Date();

    if (isTimeInPast(newStartTime)) {
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
    const { event } = removeInfo;

    if (!isTimeInPast(event.start || new Date())) {
      await removeEventFn(removeInfo);
    }
    calendarRef.current?.getApi().refetchEvents();
    calendarRef.current?.getApi().unselect();
  };

  const handleAllow: AllowFunc = (s, m) => allowEvent(s, m) && allowEventRef(s, m);

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
      selectAllow={handleAllow}
      eventAllow={handleAllow}
    />
  );
}

export default Calendar;
