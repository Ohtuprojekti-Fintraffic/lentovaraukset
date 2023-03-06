import { EventImpl } from '@fullcalendar/core/internal'
import React from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import ReservationInfoForm from '../components/forms/ReservationInfoForm'

type InfoModalProps = {
  showInfoModal: boolean
  closeReservationModal: () => void
  reservationRef: React.RefObject<EventImpl>
}

function ReservationInfoModal({
  showInfoModal,
  closeReservationModal,
  reservationRef
}: InfoModalProps ) {
  return (
    <Card show={showInfoModal} handleClose={closeReservationModal}>
        <ReservationInfoForm
          id="reservation_info_form"
          reservation={reservationRef.current ?? undefined}
          onSubmit={(updatedReservation) => {
            console.dir(updatedReservation)
            closeReservationModal()
          }}
        />
        <Button
          variant="danger"
          onClick={() => reservationRef.current?.remove()}
        >
          Poista
        </Button>
        <Button
          id="reservation_info_form"
          type="submit"
          variant="primary"
        >
          Tallenna
        </Button>
      </Card>
  )
}

export default ReservationInfoModal