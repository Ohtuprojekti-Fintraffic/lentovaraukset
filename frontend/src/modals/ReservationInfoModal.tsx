import { EventImpl } from '@fullcalendar/core/internal';
import { ConfigurationEntry, ReservationEntry, ServiceErrorCode } from '@lentovaraukset/shared/src';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import ActionSheet from '../components/ActionSheet';
import Button from '../components/Button';
import Card from '../components/Card';
import ReservationInfoForm from '../components/forms/ReservationInfoForm';
import AlertContext from '../contexts/AlertContext';
import { addReservation, modifyReservation } from '../queries/reservations';
import { ApiError, isErrorForCode } from '../queries/util';
import { useAirportContext } from '../contexts/AirportContext';

type InfoModalProps = {
  showInfoModal: boolean
  closeReservationModal: () => void
  reservation?: EventImpl
  draggedTimes?: { start: Date, end: Date }
  configuration?: ConfigurationEntry
};

function ReservationInfoModal({
  showInfoModal,
  closeReservationModal,
  reservation,
  draggedTimes,
  configuration,
}: InfoModalProps) {
  const { t } = useTranslation();

  const { addNewAlert } = useContext(AlertContext);
  const { airport } = useAirportContext();

  const onSubmitModifyHandler = async (updatedReservation: Omit<ReservationEntry, 'id' | 'user'>) => {
    try {
      await modifyReservation(
        {
          id: parseInt(reservation!.id, 10),
          start: updatedReservation.start,
          end: updatedReservation.end,
          user: 'NYI',
          aircraftId: updatedReservation.aircraftId,
          phone: updatedReservation.phone,
          info: updatedReservation.info,
        },
        airport?.code,
      );
      addNewAlert(t('reservations.modal.updated'), 'success');
    } catch (err) {
      if (await isErrorForCode(err, ServiceErrorCode.ReservationExceedsTimeslot)) {
        addNewAlert(t('reservations.modal.insideTimeslot'), 'danger');
      } else if (err instanceof ApiError) {
        addNewAlert(t('reservations.modal.updateFailed'), 'danger');
      } else {
        throw err;
      }
    }

    closeReservationModal();
  };

  const onSubmitAddHandler = async (reservationDetails: Omit<ReservationEntry, 'id' | 'user'>) => {
    try {
      await addReservation(reservationDetails, airport?.code);
      addNewAlert(t('reservations.modal.created'), 'success');
    } catch (err) {
      if (await isErrorForCode(err, ServiceErrorCode.ReservationExceedsTimeslot)) {
        addNewAlert(t('reservations.modal.insideTimeslot'), 'danger');
      } else if (err instanceof ApiError) {
        addNewAlert(t('reservations.modal.updateFailed'), 'danger');
      } else {
        throw err;
      }
    }

    closeReservationModal();
  };

  if (!showInfoModal) {
    return null;
  }

  return (
    (
      <Card
        title={reservation
          ? `${t('reservations.modal.reservation')} #${reservation.id}`
          : t('reservations.modal.newReservation')}
        escHandler={closeReservationModal}
        form={(
          <ReservationInfoForm
            id="reservation_info_form"
            reservation={reservation}
            configuration={configuration}
            draggedTimes={draggedTimes}
            onSubmit={reservation ? onSubmitModifyHandler : onSubmitAddHandler}
          />
      )}
        actionSheet={(
          <ActionSheet handleClose={closeReservationModal}>
            <Button
              form="reservation_info_form"
              type="submit"
              variant="primary"
            >
              {t('common.save')}
            </Button>
            {reservation && (
            <Button
              variant="danger"
              // This doesn't work: onClick={reservation.remove}
              // Fullcalendar might be using a context or something
              // that only works in React?
              onClick={() => reservation.remove()}
            >
              {t('common.delete')}
            </Button>
            )}
          </ActionSheet>
      )}
      />
    )
  );
}

export default ReservationInfoModal;
