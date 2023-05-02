import { EventImpl } from '@fullcalendar/core/internal';
import { TimeslotEntry, WeekInDays } from '@lentovaraukset/shared/src';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const { addNewAlert } = useContext(AlertContext);
  const { airport } = useAirportContext();

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
      addNewAlert(t('timeslots.modal.updated'), 'success');
    } catch (exception) {
      if (exception instanceof ApiError) {
        // TODO: communicate the error itself
        addNewAlert(t('timeslots.modal.updateFailed'), 'danger');
      } else {
        throw exception;
      }
    }

    closeTimeslotModal();
  };

  const onSubmitAddHandler = async (timeslotDetails: Omit<TimeslotEntry, 'id' | 'airfieldCode'>) => {
    try {
      await addTimeSlot(timeslotDetails, airport?.code);
      addNewAlert(t('timeslots.modal.created'), 'success');
    } catch (exception) {
      if (exception instanceof ApiError) {
        // TODO: communicate the error itself
        addNewAlert(t('timeslots.modal.creationFailed'), 'danger');
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
        ? `${t('timeslots.modal.timeslot')} #${timeslot.id}`
        : t('timeslots.modal.newTimeslot')}
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
            {t('common.save')}
          </Button>
          {timeslot && (
            <Button
              variant="danger"
              // This doesn't work: onClick={timeslot.remove}
              // Fullcalendar might be using a context or something
              // that only works in React?
              onClick={() => timeslot.remove()}
            >
              {t('common.delete')}
            </Button>
          )}
        </ActionSheet>
      )}
    />
  );
}

export default TimeslotInfoModal;
