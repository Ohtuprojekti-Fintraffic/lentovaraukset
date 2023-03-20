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
import { isTimeInPast, isTimeAtMostInFuture } from '@lentovaraukset/shared/src/validation/validation';
import AlertContext from '../contexts/AlertContext';

type CalendarProps = {
  calendarRef?: React.RefObject<FullCalendar>
  eventSources: EventSourceInput[];
  addEventFn: (event: { start: Date; end: Date; }) => void;
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
  checkIfTimeInFuture?: boolean;
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
  checkIfTimeInFuture = false,
}: CalendarProps) {
  const calendarRef = forwardedCalendarRef || React.createRef();
  const { addNewAlert } = React.useContext(AlertContext);

  const allowEvent: AllowFunc = (span, movingEvent) => {
    const events = calendarRef.current?.getApi().getEvents().filter(
      (e) => e.id !== movingEvent?.id
        && e.start && e.end
        && !e.display.includes('background')
        && e.start < span.end && e.end > span.start,
    );

    return events
      ? countMostConcurrent(events as { start: Date, end: Date }[]) < maxConcurrentLimit
      : true;
  };

  const timeIsConsecutive = (start: Date, end: Date) => {
    const consecutive = calendarRef.current?.getApi().getEvents().some(
      (e) => e.extendedProps.description === 'timeslot'
      && e.start && e.end
      && ((start.getTime() !== e.start.getTime()) && (end.getTime() !== e.end.getTime()))
      && (e.start.getTime() === start.getTime()
        || e.start.getTime() === end.getTime()
        || e.end.getTime() === start.getTime()
        || e.end.getTime() === end.getTime()),
    );
    return consecutive;
  };

  const isTimeAllowed = (start: Date, end: Date) => {
    if (isTimeInPast(start)) {
      calendarRef.current?.getApi().unselect();
      addNewAlert('Aikaa ei voi lisätä menneisyyteen', 'warning');
      return false;
    }
    // TODO: Get timeAtMostInFuture from airfield
    if (checkIfTimeInFuture && !isTimeAtMostInFuture(start, 7)) {
      calendarRef.current?.getApi().unselect();
      addNewAlert('Aikaa ei voi lisätä yli 7 päivän päähän', 'warning');
      return false;
    }
    if (timeIsConsecutive(start, end)) {
      calendarRef.current?.getApi().unselect();
      addNewAlert('Ajat eivät voi olla peräkkäin', 'warning');
      return false;
    }
    return true;
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

    if (isTimeAllowed(event.start || new Date(), event.end || new Date())) {
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
    const newEndime: Date = dropData.end || new Date();

    if (!isTimeAllowed(newStartTime, newEndime)) return;

    addEventFn({
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
