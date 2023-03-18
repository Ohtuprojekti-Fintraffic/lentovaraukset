import { EventImpl } from '@fullcalendar/core/internal';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import React, { useContext } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import ReservationInfoForm from '../components/forms/ReservationInfoForm';
import AlertContext from '../contexts/AlertContext';
import { addReservation, modifyReservation } from '../queries/reservations';
import { ApiError } from '../queries/util';

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

      if (modifiedReservation) {
        addNewAlert(`Varaus #${modifiedReservation.id} päivitetty!`, 'success');
      }
    } catch (exception) {
      if (exception instanceof ApiError) {
        // TODO: communicate the error itself which would
        // require the server to send it as an error code or similar
        addNewAlert('Virhe tapahtui varausta päivittäessä', 'danger');
      } else {
        throw exception;
      }
    }

    closeReservationModal();
  };

  const onSubmitAddHandler = async (reservationDetails: Omit<ReservationEntry, 'id' | 'user'>) => {
    await addReservation(reservationDetails);
    // TODO: add user
    closeReservationModal();
  };

  return (
    <Card show={showInfoModal} handleClose={closeReservationModal}>
      <ReservationInfoForm
        id="reservation_info_form"
        reservation={reservation}
        draggedTimes={draggedTimes}
        onSubmit={reservation ? onSubmitModifyHandler : onSubmitAddHandler}
      />
      {reservation && (
      <Button
        variant="danger"
        onClick={() => removeReservation()}
      >
        Poista
      </Button>
      )}
      <Button
        form="reservation_info_form"
        type="submit"
        variant="primary"
      >
        Tallenna
      </Button>
    </Card>
  );
}

export default ReservationInfoModal;
