import { EventImpl } from '@fullcalendar/core/internal';
import { ReservationEntry, ServiceErrorCode } from '@lentovaraukset/shared/src';
import React, { useContext } from 'react';
import ActionSheet from '../components/ActionSheet';
import Button from '../components/Button';
import Card from '../components/Card';
import ReservationInfoForm from '../components/forms/ReservationInfoForm';
import AlertContext from '../contexts/AlertContext';
import { addReservation, modifyReservation } from '../queries/reservations';
import { ApiError, isErrorForCode } from '../queries/util';

type InfoModalProps = {
  showInfoModal: boolean
  closeReservationModal: () => void
  reservation?: EventImpl
  draggedTimes?: { start: Date, end: Date }
  removeReservation: () => void
};

function ReservationInfoModal({
  showInfoModal,
  closeReservationModal,
  reservation, draggedTimes,
  removeReservation,
}: InfoModalProps) {
  const { addNewAlert } = useContext(AlertContext);

  const onSubmitModifyHandler = async (updatedReservation: Omit<ReservationEntry, 'id' | 'user'>) => {
    try {
      const modifiedReservation = await modifyReservation(
        {
          id: parseInt(reservation!.id, 10),
          start: updatedReservation.start,
          end: updatedReservation.end,
          user: 'NYI',
          aircraftId: updatedReservation.aircraftId,
          phone: updatedReservation.phone,
          info: updatedReservation.info,
        },
      );
      addNewAlert(`Varaus #${modifiedReservation.id} päivitetty!`, 'success');
    } catch (err) {
      if (await isErrorForCode(err, ServiceErrorCode.ReservationExceedsTimeslot)) {
        addNewAlert('Aikavarauksen täytyy olla aikaikkunan sisällä', 'danger');
      } else if (err instanceof ApiError) {
        addNewAlert('Virhe tapahtui varausta päivittäessä', 'danger');
      } else {
        throw err;
      }
    }

    closeReservationModal();
  };

  const onSubmitAddHandler = async (reservationDetails: Omit<ReservationEntry, 'id' | 'user'>) => {
    try {
      await addReservation(reservationDetails);
      addNewAlert('Varaus lisätty!', 'success');
    } catch (err) {
      if (await isErrorForCode(err, ServiceErrorCode.ReservationExceedsTimeslot)) {
        addNewAlert('Aikavarauksen täytyy olla aikaikkunan sisällä', 'danger');
      } else if (err instanceof ApiError) {
        addNewAlert('Virhe tapahtui varausta päivittäessä', 'danger');
      } else {
        throw err;
      }
    }

    closeReservationModal();
  };

  return (
    (
      <Card
        show={showInfoModal}
        handleClose={closeReservationModal}
        title={reservation
          ? `Varaus #${reservation.id}`
          : 'Uusi varaus'}
        form={(
          <ReservationInfoForm
            id="reservation_info_form"
            reservation={reservation}
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
              Tallenna
            </Button>
            {reservation && (
            <Button
              variant="danger"
              onClick={() => removeReservation()}
            >
              Poista
            </Button>
            )}
          </ActionSheet>
      )}
      />
    )
  );
}

export default ReservationInfoModal;
