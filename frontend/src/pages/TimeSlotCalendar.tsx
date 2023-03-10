import { EventRemoveArg, EventSourceFunc } from '@fullcalendar/core';
import { EventImpl } from '@fullcalendar/core/internal';
import FullCalendar from '@fullcalendar/react';
import React, { useState, useRef } from 'react';
import Calendar from '../components/Calendar';
import TimeslotInfoModal from '../modals/TimeslotInfoModal';
import useAirfield from '../queries/airfields';
import {
  getReservations,
} from '../queries/reservations';
import {
  getTimeSlots, modifyTimeSlot, addTimeSlot, deleteTimeslot,
} from '../queries/timeSlots';

function TimeSlotCalendar() {
  const { data: airfield } = useAirfield(1); // TODO: get id from airfield selection
  const [showInfoModal, setShowInfoModal] = useState(false);
  const selectedTimeslotRef = useRef<EventImpl | null>(null);
  const calendarRef: React.RefObject<FullCalendar> = React.createRef();

  const timeSlotsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const timeslots = await getTimeSlots(start, end);
      const timeslotsMapped = timeslots.map((timeslot) => ({
        ...timeslot, color: '#84cc1680',
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
      <Calendar
        calendarRef={calendarRef}
        eventSources={eventsSourceRef.current}
        addEventFn={addTimeSlot}
        modifyEventFn={modifyTimeSlot}
        clickEventFn={clickTimeslot}
        removeEventFn={removeTimeSlot}
        granularity={airfield && { minutes: airfield.eventGranularityMinutes }}
        eventColors={{ backgroundColor: '#bef264', eventColor: '#84cc1680', textColor: '#000000' }}
        selectConstraint={undefined}
        maxConcurrentLimit={1}
      />
    </div>
  );
}

export default TimeSlotCalendar;
