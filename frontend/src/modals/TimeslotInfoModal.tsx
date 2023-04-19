import { EventImpl } from '@fullcalendar/core/internal';
import { TimeslotEntry, WeekInDays } from '@lentovaraukset/shared/src';
import React, { useContext } from 'react';
import ActionSheet from '../components/ActionSheet';
import Button from '../components/Button';
import Card from '../components/Card';
import RecurringTimeslotForm from '../components/forms/RecurringTimeslotForm';
import AlertContext from '../contexts/AlertContext';
import { addTimeSlot } from '../queries/timeSlots';
import { ApiError } from '../queries/util';
import { useAirportContext } from '../contexts/AirportContext';

type InfoModalProps = {
  showInfoModal: boolean
  closeTimeslotModal: () => void
  timeslot?: EventImpl
  isBlocked: boolean
  draggedTimes?: { start: Date, end: Date }
  modifyTimeslotFn: (
    timeslot: EventImpl,
    period?: {
      end: Date,
      days: WeekInDays,
    },
  ) => Promise<void>,
};

function TimeslotInfoModal({
  showInfoModal,
  isBlocked,
  closeTimeslotModal,
  timeslot, draggedTimes,
  modifyTimeslotFn,
}: InfoModalProps) {
  const { addNewAlert } = useContext(AlertContext);
  const { airport } = useAirportContext(); // TODO: get id from airfield selection

  const onModifySubmitHandler = async (
    updatedTimeslot: Omit<TimeslotEntry, 'id' | 'airfieldCode'>,
    period?: {
      end: Date,
      days: WeekInDays,
    },
  ) => {
    try {
      if (!timeslot) return;
      await modifyTimeslotFn(
        /* TS does not recognize that the spread operator
        will ensure that all properties of EventImpl are present */
        {
          ...timeslot,
          ...updatedTimeslot,
          id: timeslot!.id,
          extendedProps: {
            info: updatedTimeslot.info,
            type: updatedTimeslot.type,
            group: timeslot?.extendedProps.group ?? null,
          },
        } as unknown as EventImpl,
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

  const onSubmitAddHandler = async (timeslotDetails: Omit<TimeslotEntry, 'id' | 'airfieldCode'>) => {
    try {
      await addTimeSlot(timeslotDetails, airport?.code);
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

  if (!showInfoModal) {
    return null;
  }

  return (
    <Card
      title={timeslot
        ? `Aikaikkuna #${timeslot.id}`
        : 'Uusi aikaikkuna'}
      escHandler={closeTimeslotModal}
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
              // This doesn't work: onClick={timeslot.remove}
              // Fullcalendar might be using a context or something
              // that only works in React?
              onClick={() => timeslot.remove()}
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
