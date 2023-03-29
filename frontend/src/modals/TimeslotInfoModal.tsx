import { EventImpl } from '@fullcalendar/core/internal';
import { TimeslotEntry, WeekInDays } from '@lentovaraukset/shared/src';
import React, { useContext } from 'react';
import ActionSheet from '../components/ActionSheet';
import Button from '../components/Button';
import Card from '../components/Card';
import RecurringTimeslotForm from '../components/forms/RecurringTimeslotForm';
import AlertContext from '../contexts/AlertContext';
import { addTimeSlot, modifyTimeSlot } from '../queries/timeSlots';
import { ApiError } from '../queries/util';

type InfoModalProps = {
  showInfoModal: boolean
  closeTimeslotModal: () => void
  timeslot?: EventImpl
  isBlocked: boolean
  draggedTimes?: { start: Date, end: Date }
  removeTimeslot: () => void
};

function TimeslotInfoModal({
  showInfoModal,
  isBlocked,
  closeTimeslotModal,
  timeslot, draggedTimes,
  removeTimeslot,
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
      await modifyTimeSlot(
        {
          id: Number(timeslot!.id),
          start: updatedTimeslot.start,
          end: updatedTimeslot.end,
          type: updatedTimeslot.type,
          info: updatedTimeslot.info,
        },
        period
          ? {
            end: period.end,
            name: period.periodName,
            days: period.days,
          }
          : undefined,
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
    <Card
      show={showInfoModal}
      handleClose={closeTimeslotModal}
      form={(
        <RecurringTimeslotForm
          id="recurring_timeslot_form"
          timeslot={timeslot}
          isBlocked={isBlocked}
          draggedTimes={draggedTimes}
          onSubmit={timeslot ? onModifySubmitHandler : onSubmitAddHandler}
        />
      )}
      actionSheet={(
        <ActionSheet handleClose={closeTimeslotModal}>
          <Button
            form="recurring_timeslot_form"
            type="submit"
            variant="primary"
          >
            Tallenna
          </Button>
          {timeslot && (
            <Button
              variant="danger"
              onClick={() => removeTimeslot()}
            >
              Poista
            </Button>
          )}
        </ActionSheet>
      )}
    />
  );
}

export default TimeslotInfoModal;
