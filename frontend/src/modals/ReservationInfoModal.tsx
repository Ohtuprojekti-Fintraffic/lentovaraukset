import { EventImpl } from '@fullcalendar/core/internal';
import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import ReservationInfoForm from '../components/forms/ReservationInfoForm';
import { modifyReservation } from '../queries/reservations';

type InfoModalProps = {
  showInfoModal: boolean
  closeReservationModal: () => void
  reservation?: EventImpl
  removeReservation: () => void
};

function ReservationInfoModal({
  showInfoModal,
  closeReservationModal,
  reservation,
  removeReservation,
}: InfoModalProps) {
  return (
    <Card show={showInfoModal} handleClose={closeReservationModal}>
      <ReservationInfoForm
        id="reservation_info_form"
        reservation={reservation}
        onSubmit={async (updatedReservation) => {
          console.dir(updatedReservation);

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

          closeReservationModal();
        }}
      />
      <Button
        variant="danger"
        onClick={() => removeReservation()}
      >
        Poista
      </Button>
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
