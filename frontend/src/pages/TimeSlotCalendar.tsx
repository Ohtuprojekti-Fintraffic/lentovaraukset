import { EventRemoveArg, EventSourceFunc, AllowFunc } from '@fullcalendar/core';
import { EventImpl } from '@fullcalendar/core/internal';
import FullCalendar from '@fullcalendar/react';
import React, { useState, useRef } from 'react';
import { isTimeInPast } from '@lentovaraukset/shared/src/validation/validation';
import { TimeslotType } from '@lentovaraukset/shared/src';
import Calendar from '../components/Calendar';
import TimeslotInfoModal from '../modals/TimeslotInfoModal';
import { useAirfield } from '../queries/airfields';
import {
  getReservations,
} from '../queries/reservations';
import {
  getTimeSlots, modifyTimeSlot, addTimeSlot, deleteTimeslot,
} from '../queries/timeSlots';

function TimeSlotCalendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const { data: airfield } = useAirfield(1); // TODO: get id from airfield selection
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const selectedTimeslotRef = useRef<EventImpl | null>(null);

  const timeSlotsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const timeslots = await getTimeSlots(start, end);
      const timeslotsMapped = timeslots.map((timeslot) => {
        const timeslotEvent = {
          ...timeslot,
          id: timeslot.id.toString(),
          color: timeslot.type === 'available' ? '#84cc1680' : '#eec200',
          title: timeslot.type === 'available' ? 'Vapaa' : 'Suljettu',
          editable: !isTimeInPast(timeslot.start),
        };
        return timeslot.group ? { ...timeslotEvent, groupId: timeslot.group } : timeslotEvent;
      });
      successCallback(timeslotsMapped);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  const reservationsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const reservations = await getReservations(start, end);

      const reservationsMapped = reservations.map((reservation) => ({
        ...reservation, id: reservation.id.toString(), groupId: 'reservations', display: 'background', color: '#000000',
      }));

      successCallback(reservationsMapped);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  const eventsSourceRef = useRef([reservationsSourceFn, timeSlotsSourceFn]);

  const clickTimeslot = async (event: EventImpl): Promise<void> => {
    selectedTimeslotRef.current = event;
    setShowInfoModal(true);
  };

  const closeTimeslotModalFn = () => {
    setShowInfoModal(false);
  };

  const addTimeslotFn = async (event: { start: Date, end: Date }) => {
    await addTimeSlot({ ...event, type: blocked ? 'blocked' : 'available' });
  };

  const modifyTimeslotFn = async (
    event: { id: string, start: Date, end: Date, extendedProps: { type: TimeslotType } },
  ) => {
    await modifyTimeSlot({
      ...event, id: Number(event.id), type: event.extendedProps.type,
    });
  };

  const removeTimeSlot = async (removeInfo: EventRemoveArg) => {
    const { event } = removeInfo;
    await deleteTimeslot(Number(event.id));
    setShowInfoModal(false);
  };

  const isSameType = (
    stillEventType: TimeslotType,
    movingEventType?: TimeslotType,
  ) => {
    if (movingEventType) return stillEventType === movingEventType;
    return ((stillEventType === 'available' && !blocked) || (stillEventType === 'blocked' && blocked));
  };

  const allowEvent: AllowFunc = (span, movingEvent) => {
    const eventsByType = calendarRef.current?.getApi().getEvents()
      .filter((e) => e.id !== movingEvent?.id && e.groupId !== 'reservations'
      && isSameType(e.extendedProps.type, movingEvent?.extendedProps?.type));

    const timeIsConsecutive = eventsByType?.some(
      (e) => e.start && e.end
        && (e.start.getTime() === span.start.getTime()
        || e.start.getTime() === span.end.getTime()
        || e.end.getTime() === span.start.getTime()
        || e.end.getTime() === span.end.getTime()),
    );
    const overlap = eventsByType?.some(
      (e) => e.start && e.end
        && e.start < span.end && e.end > span.start,
    );
    return !timeIsConsecutive && !overlap;
  };

  const handleToggle = () => {
    setBlocked(!blocked);
    calendarRef.current?.getApi().refetchEvents();
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <TimeslotInfoModal
        showInfoModal={showInfoModal}
        timeslot={selectedTimeslotRef?.current || undefined}
        removeTimeslot={() => {
          selectedTimeslotRef.current?.remove();
        }}
        closeTimeslotModal={() => {
          closeTimeslotModalFn();
          selectedTimeslotRef.current = null;
          calendarRef.current?.getApi().refetchEvents();
        }}
      />

      <h1 className="text-3xl">Vapaat varausikkunat</h1>
      <div>
        <label htmlFor="checkbox" className="font-ft-label mb-1">
          <span>Lisää suljettuja vuoroja</span>
          <input
            type="checkbox"
            id="checkbox"
            checked={blocked}
            onChange={handleToggle}
            className="mx-2"
          />
        </label>
      </div>
      <Calendar
        calendarRef={calendarRef}
        eventSources={eventsSourceRef.current}
        addEventFn={addTimeslotFn}
        modifyEventFn={modifyTimeslotFn}
        clickEventFn={clickTimeslot}
        removeEventFn={removeTimeSlot}
        granularity={airfield && { minutes: airfield.eventGranularityMinutes }}
        eventColors={{ backgroundColor: blocked ? '#eec200' : '#bef264', eventColor: blocked ? '#b47324' : '#84cc1680', textColor: '#000000' }}
        selectConstraint={undefined}
        maxConcurrentLimit={1}
        allowEventRef={allowEvent}
      />
    </div>
  );
}

export default TimeSlotCalendar;
