import { EventRemoveArg, EventSourceFunc } from '@fullcalendar/core';
import React, { useState, useRef } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import Calendar from '../components/Calendar';
import {
  getReservations,
  addReservation,
  modifyReservation,
  deleteReservation,
} from '../queries/reservations';
import Card from '../components/Card';
import { getTimeSlots } from '../queries/timeSlots';
import Button from '../components/Button';
import ReservationInfoForm from '../components/forms/ReservationInfoForm';

function ReservationCalendar() {
  const [showInspectModal, setShowInspectModal] = useState(false);
  const selectedReservationRef = useRef<EventImpl | null>(null);
  const reservationInfoFormRef = useRef<string>("reservation_info_form");

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
        ...timeSlot, groupId: 'timeslots', display: 'inverse-background', color: '#2C2C44',
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

  const clickReservation = async (event:EventImpl): Promise<void> => {
    selectedReservationRef.current = event;
    setShowInspectModal(true);
  };

  const closeReservationModalFn = () => {
    setShowInspectModal(false);
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

    await modifyReservation({
      id: parseInt(event.id, 10),
      start: event.start,
      end: event.end,
      user,
      aircraftId,
      phone,
      email,
      info,
    });
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <Card show={showInspectModal} handleClose={closeReservationModalFn}>
        <ReservationInfoForm
          id={reservationInfoFormRef.current}
          reservation={selectedReservationRef.current ?? undefined}
        />
        <Button
          variant="danger"
          onClick={() => selectedReservationRef.current?.remove()}
        >
          Poista
        </Button>
        <Button
          id={reservationInfoFormRef.current}
          type={"submit"}
          variant="primary"
        >
          Tallenna
        </Button>
      </Card>
      <h1 className="text-3xl">Varauskalenteri</h1>
      <Calendar
        eventSources={eventsSourceRef.current}
        addEventFn={addReservation}
        modifyEventFn={modifyReservationFn}
        clickEventFn={clickReservation}
        removeEventFn={removeReservation}
        granularity={{ minutes: 20 }} // TODO: Get from airfield api
        eventColors={{ backgroundColor: '#000000', eventColor: '#FFFFFFF', textColor: '#FFFFFF' }}
        selectConstraint="timeslots"
        maxConcurrentLimit={3} // TODO: get from airfield api
      />
    </div>
  );
}

export default ReservationCalendar;
