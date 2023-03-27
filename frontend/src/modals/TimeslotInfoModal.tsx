import { EventImpl } from '@fullcalendar/core/internal';
import { TimeslotEntry, TimeslotType, WeekInDays } from '@lentovaraukset/shared/src';
import React, { useContext } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import RecurringTimeslotForm from '../components/forms/RecurringTimeslotForm';
import AlertContext from '../contexts/AlertContext';
import { addTimeSlot } from '../queries/timeSlots';
import { ApiError } from '../queries/util';

type InfoModalProps = {
  showInfoModal: boolean
  closeTimeslotModal: () => void
  timeslot?: EventImpl
  isBlocked: boolean
  draggedTimes?: { start: Date, end: Date }
  removeTimeslot: () => void
  modifyTimeslotFn: (
    timeslot: {
      id: string,
      start: Date,
      end: Date,
      extendedProps: { type: TimeslotType, info: string | null, group: string | null },
    },
    period?: {
      end: Date,
      periodName: string,
      days: WeekInDays,
    },
  ) => Promise<void>,
};

function TimeslotInfoModal({
  showInfoModal,
  isBlocked,
  closeTimeslotModal,
  timeslot, draggedTimes,
  removeTimeslot,
  modifyTimeslotFn,
}: InfoModalProps) {
  const { addNewAlert } = useContext(AlertContext);

  const onModifySubmitHandler = async (
    updatedTimeslot: Omit<TimeslotEntry, 'id'>,
    period?: {
      end: Date,
      periodName: string,
      days: WeekInDays,
    },
  ) => {
    try {
      await modifyTimeslotFn(
        {
          ...updatedTimeslot,
          id: timeslot!.id,
          extendedProps: {
            info: updatedTimeslot.info,
            type: updatedTimeslot.type,
            group: timeslot?.extendedProps.group ?? null,
          },
        },
        period,
      );
      addNewAlert('Aikaikkuna päivitetty!', 'success');
    } catch (exception) {
      if (exception instanceof ApiError) {
        // TODO: communicate the error itself
        addNewAlert('Virhe tapahtui varausta päivittäessä', 'danger');
      } else {
        throw exception;
      }
    }

    closeTimeslotModal();
  };

  const onSubmitAddHandler = async (reservationDetails: Omit<TimeslotEntry, 'id'>) => {
    try {
      await addTimeSlot(reservationDetails);
      addNewAlert('Aikaikkuna lisätty!', 'success');
    } catch (exception) {
      if (exception instanceof ApiError) {
        // TODO: communicate the error itself
        addNewAlert('Virhe tapahtui aikaikkunaa lisätessä', 'danger');
      } else {
        throw exception;
      }
    }

    closeTimeslotModal();
  };

  return (
    <Card show={showInfoModal} handleClose={closeTimeslotModal}>
      <RecurringTimeslotForm
        id="recurring_timeslot_form"
        timeslot={timeslot}
        isBlocked={isBlocked}
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
