import { EventRemoveArg, EventSourceFunc } from '@fullcalendar/core';
import React, { useState, useRef, useContext } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import FullCalendar from '@fullcalendar/react';
import { isTimeInPast } from '@lentovaraukset/shared/src/validation/validation';
import Calendar from '../components/Calendar';
import {
  getReservations,
  modifyReservation,
  deleteReservation,
} from '../queries/reservations';
import { getTimeSlots } from '../queries/timeSlots';
import ReservationInfoModal from '../modals/ReservationInfoModal';
import { useAirfield } from '../queries/airfields';
import Button from '../components/Button';
import AlertContext from '../contexts/AlertContext';

function ReservationCalendar() {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const selectedReservationRef = useRef<EventImpl | null>(null);
  const draggedTimesRef = useRef<{ start: Date, end: Date } | null>(null);
  const calendarRef: React.RefObject<FullCalendar> = React.createRef();

  const { data: airfield } = useAirfield(1); // TODO: get id from airfield selection
  const { addNewAlert } = useContext(AlertContext);
  const reservationsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const reservations = await getReservations(start, end);

      const reservationsMapped = reservations.map((reservation) => ({
        ...reservation,
        id: reservation.id.toString(),
        title: reservation.aircraftId,
        constraint: 'timeslots',
        extendedProps: {
          user: reservation.user,
          aircraftId: reservation.aircraftId,
          phone: reservation.phone,
          email: reservation.email,
          info: reservation.info,
        },
        editable: !isTimeInPast(reservation.start),
      }));

      successCallback(reservationsMapped);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  const timeSlotsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const timeslots = await getTimeSlots(start, end);
      const timeslotsMapped = timeslots.map((timeSlot) => ({
        ...timeSlot, id: timeSlot.id.toString(), groupId: 'timeslots', display: 'inverse-background', color: '#2C2C44',
      }));

      const notReservable = [{
        title: 'ei varattavissa', start, end, display: 'background', color: '#2C2C44', overlap: false,
      }];

      successCallback(timeslotsMapped.length ? timeslotsMapped : notReservable);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  const eventsSourceRef = useRef([reservationsSourceFn, timeSlotsSourceFn]);

  const clickReservation = async (event: EventImpl): Promise<void> => {
    if (event.end && isTimeInPast(event.end)) {
      return;
    }

    selectedReservationRef.current = event;

    setShowInfoModal(true);
  };

  const closeReservationModalFn = () => {
    setShowInfoModal(false);
  };

  const removeReservation = async (removeInfo: EventRemoveArg) => {
    const { event } = removeInfo;
    const res = await deleteReservation(Number(event.id));
    if (res === `Reservation ${selectedReservationRef.current?.id} deleted`) {
      closeReservationModalFn();
      selectedReservationRef.current = null;
    } else {
      removeInfo.revert();
      throw new Error('Removing reservation failed');
    }
  };

  const modifyReservationFn = async (event: {
    id: string;
    start: Date;
    end: Date,
    extendedProps: any
  }): Promise<void> => {
    const {
      user, aircraftId, phone, email, info,
    } = event.extendedProps;

    const modifiedReservation = await modifyReservation({
      id: parseInt(event.id, 10),
      start: event.start,
      end: event.end,
      user,
      aircraftId,
      phone,
      email,
      info,
    });
    if (modifiedReservation) {
      addNewAlert('Reservation modified', 'success');
    }
  };

  const showModalAfterDrag = (times: { start: Date, end: Date }) => {
    draggedTimesRef.current = times;
    setShowInfoModal(true);
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <ReservationInfoModal
        showInfoModal={showInfoModal}
        reservation={selectedReservationRef?.current || undefined}
        draggedTimes={draggedTimesRef?.current || undefined}
        removeReservation={() => {
          selectedReservationRef.current?.remove();
        }}
        closeReservationModal={() => {
          closeReservationModalFn();
          selectedReservationRef.current = null;
          calendarRef.current?.getApi().refetchEvents();
        }}
      />
      <div className="flex flex-row justify-between">
        <h1 className="text-3xl">Varauskalenteri</h1>
        <Button variant="primary" onClick={() => setShowInfoModal(true)}>Uusi varaus</Button>
      </div>
      <Calendar
        calendarRef={calendarRef}
        eventSources={eventsSourceRef.current}
        addEventFn={showModalAfterDrag}
        modifyEventFn={modifyReservationFn}
        clickEventFn={clickReservation}
        removeEventFn={removeReservation}
        granularity={airfield && { minutes: airfield.eventGranularityMinutes }}
        eventColors={{ backgroundColor: '#000000', eventColor: '#FFFFFFF', textColor: '#FFFFFF' }}
        selectConstraint="timeslots"
        maxConcurrentLimit={airfield?.maxConcurrentFlights}
        checkIfTimeInFuture
      />
    </div>
  );
}

export default ReservationCalendar;
