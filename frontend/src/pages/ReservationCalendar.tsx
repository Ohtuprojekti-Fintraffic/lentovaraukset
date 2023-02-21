import { EventSourceFunc } from '@fullcalendar/core';
import React, { useState } from 'react';

import { useMutation } from 'react-query';
import FullCalendar from '@fullcalendar/react';
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
  const [selectedReservation, setSelectedReservation] = useState<Partial<{
    id: string,
    start: Date,
    end: Date,
    title: string
  }>>({});

  const calendarRef: React.RefObject<FullCalendar> = React.createRef();

  const reservationsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const reservations = await getReservations(start, end);

      const reservationsMapped = reservations.map((reservation) => ({
        ...reservation, constraint: 'timeslots',
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

  const deleteReservationFn = useMutation((id: Number) => deleteReservation(id));

  const clickReservation = async (event: {
    id: string;
    start?: Date;
    end?: Date;
    title: string
  }): Promise<void> => {
    setSelectedReservation(event);
    setShowInspectModal(true);
  };

  const closeReservationModalFn = () => {
    setShowInspectModal(false);
    calendarRef.current?.getApi().refetchEvents();
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <Card show={showInspectModal} handleClose={closeReservationModalFn}>
        <ReservationInfoForm
          reservation={selectedReservation}
        />
        <Button
          variant="danger"
          onClick={async () => {
            await deleteReservationFn.mutateAsync(Number(selectedReservation.id));
            closeReservationModalFn();
          }}
        >
          Poista
        </Button>
        <Button
          variant="primary"
          onClick={() => { setShowInspectModal(false); }}
        >
          Tallenna
        </Button>
      </Card>
      <h1 className="text-3xl">Varauskalenteri</h1>
      <Calendar
        calendarRef={calendarRef}
        eventSources={[reservationsSourceFn, timeSlotsSourceFn]}
        addEventFn={addReservation}
        modifyEventFn={modifyReservation}
        clickEventFn={clickReservation}
        granularity={{ minutes: 20 }} // TODO: Get from airfield api
        eventColors={{ backgroundColor: '#000000', eventColor: '#FFFFFFF', textColor: '#FFFFFF' }}
        selectConstraint="timeslots"
      />
    </div>
  );
}

export default ReservationCalendar;
