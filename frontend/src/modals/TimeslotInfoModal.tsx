import { EventImpl } from '@fullcalendar/core/internal';
import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import RecurringTimeslotForm from '../components/forms/RecurringTimeslotForm';
import { modifyTimeSlot } from '../queries/timeSlots';

type InfoModalProps = {
  showInfoModal: boolean
  closeTimeslotModal: () => void
  timeslot?: EventImpl
  removeTimeslot: () => void
};

function TimeslotInfoModal({
  showInfoModal,
  closeTimeslotModal,
  timeslot,
  removeTimeslot,
}: InfoModalProps) {
  return (
    <Card show={showInfoModal} handleClose={closeTimeslotModal}>
      <RecurringTimeslotForm
        id="recurring_timeslot_form"
        timeslot={timeslot}
        onSubmit={async (updatedTimeslot, period) => {
          await modifyTimeSlot(
            {
              id: timeslot!.id,
              start: updatedTimeslot.start,
              end: updatedTimeslot.end,
            },
            period ? {
              end: period.end,
              name: period.periodName,
            } : undefined,
          );
          closeTimeslotModal();
        }}
      />
      <Button
        variant="danger"
        onClick={() => removeTimeslot()}
      >
        Poista
      </Button>
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
