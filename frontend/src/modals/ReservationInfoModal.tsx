import { EventImpl } from '@fullcalendar/core/internal';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import ReservationInfoForm from '../components/forms/ReservationInfoForm';
import { addReservation, modifyReservation } from '../queries/reservations';

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
  const onSubmitModifyHandler = async (updatedReservation: Omit<ReservationEntry, 'id' | 'user'>) => {
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
    );
  };

  const onSubmitAddHandler = async (reservationDetails: Omit<ReservationEntry, 'id' | 'user'>) => {
    await addReservation(reservationDetails);

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
