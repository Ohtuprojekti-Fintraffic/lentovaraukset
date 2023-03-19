import { EventImpl } from '@fullcalendar/core/internal';
import { TimeslotEntry } from '@lentovaraukset/shared/src';
import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import RecurringTimeslotForm from '../components/forms/RecurringTimeslotForm';
import { addTimeSlot, modifyTimeSlot } from '../queries/timeSlots';

type InfoModalProps = {
  showInfoModal: boolean
  closeTimeslotModal: () => void
  timeslot?: EventImpl
  draggedTimes?: { start: Date, end: Date }
  removeTimeslot: () => void
};

function TimeslotInfoModal({
  showInfoModal,
  closeTimeslotModal,
  timeslot, draggedTimes,
  removeTimeslot,
}: InfoModalProps) {
  const onModifySubmitHandler = async (updatedTimeslot: Omit<TimeslotEntry, 'id'>, period?: { end: Date, periodName: string }) => {
    console.log(updatedTimeslot, period);
    await modifyTimeSlot(
      {
        id: timeslot!.id,
        start: updatedTimeslot.start,
        end: updatedTimeslot.end,
      },
      period ? { end: period.end, name: period.periodName } : undefined,
    );

    closeTimeslotModal();
  };

  const onSubmitAddHandler = async (reservationDetails: Omit<TimeslotEntry, 'id'>) => {
    await addTimeSlot(
      reservationDetails,
    );

    closeTimeslotModal();
  };

  return (
    <Card show={showInfoModal} handleClose={closeTimeslotModal}>
      <RecurringTimeslotForm
        id="recurring_timeslot_form"
        timeslot={timeslot}
        draggedTimes={draggedTimes}
        onSubmit={timeslot ? onModifySubmitHandler : onSubmitAddHandler}
      />
      {timeslot && (
      <Button
        variant="danger"
        onClick={() => removeTimeslot()}
      >
        Poista
      </Button>
      )}
      <Button
        form="recurring_timeslot_form"
        type="submit"
        variant="primary"
      >
        Tallenna
      </Button>
    </Card>
  );
}

export default TimeslotInfoModal;
