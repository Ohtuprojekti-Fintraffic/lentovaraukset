import { EventRemoveArg, EventSourceFunc, AllowFunc } from '@fullcalendar/core';
import { EventImpl } from '@fullcalendar/core/internal';
import FullCalendar from '@fullcalendar/react';
import React, { useState, useRef } from 'react';
import { isTimeInPast } from '@lentovaraukset/shared/src/validation/validation';
import Button from '../components/Button';
import Calendar from '../components/Calendar';
import TimeslotInfoModal from '../modals/TimeslotInfoModal';
import { useAirfield } from '../queries/airfields';
import {
  getReservations,
} from '../queries/reservations';
import {
  getTimeSlots, modifyTimeSlot, deleteTimeslot,
} from '../queries/timeSlots';

function TimeSlotCalendar() {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const selectedTimeslotRef = useRef<EventImpl | null>(null);
  const draggedTimesRef = useRef<{ start: Date, end: Date } | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  const { data: airfield } = useAirfield(1); // TODO: get id from airfield selection

  const timeSlotsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const timeslots = await getTimeSlots(start, end);
      const timeslotsMapped = timeslots.map((timeslot) => ({
        ...timeslot,
        id: timeslot.id.toString(),
        color: '#84cc1680',
        editable: !isTimeInPast(timeslot.start),
      }));
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

  const removeTimeSlot = async (removeInfo: EventRemoveArg) => {
    const { event } = removeInfo;
    await deleteTimeslot(Number(event.id));
    setShowInfoModal(false);
  };

  const allowEvent: AllowFunc = (span, movingEvent) => {
    const timeIsConsecutive = calendarRef.current?.getApi().getEvents().some(
      (e) => e.id !== movingEvent?.id
        && e.groupId !== 'reservations'
        && e.start && e.end
        && (e.start.getTime() === span.start.getTime()
          || e.start.getTime() === span.end.getTime()
          || e.end.getTime() === span.start.getTime()
          || e.end.getTime() === span.end.getTime()),
    );

    return !timeIsConsecutive;
  };

  const showModalAfterDrag = (times: { start: Date, end: Date }) => {
    draggedTimesRef.current = times;
    setShowInfoModal(true);
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <TimeslotInfoModal
        showInfoModal={showInfoModal}
        timeslot={selectedTimeslotRef?.current || undefined}
        draggedTimes={draggedTimesRef?.current || undefined}
        removeTimeslot={() => {
          selectedTimeslotRef.current?.remove();
        }}
        closeTimeslotModal={() => {
          closeTimeslotModalFn();
          selectedTimeslotRef.current = null;
          calendarRef.current?.getApi().refetchEvents();
        }}
      />

      <div className="flex flex-row justify-between">
        <h1 className="text-3xl">Vapaat varausikkunat</h1>
        <Button variant="primary" onClick={() => setShowInfoModal(true)}>Uusi varausikkuna</Button>
      </div>
      <Calendar
        calendarRef={calendarRef}
        eventSources={eventsSourceRef.current}
        addEventFn={showModalAfterDrag}
        modifyEventFn={modifyTimeSlot}
        clickEventFn={clickTimeslot}
        removeEventFn={removeTimeSlot}
        granularity={airfield && { minutes: airfield.eventGranularityMinutes }}
        eventColors={{ backgroundColor: '#bef264', eventColor: '#84cc1680', textColor: '#000000' }}
        selectConstraint={undefined}
        maxConcurrentLimit={1}
        allowEventRef={allowEvent}
      />
    </div>
  );
}

export default TimeSlotCalendar;
