import { EventImpl } from '@fullcalendar/core/internal'
import FullCalendar from '@fullcalendar/react'
import React from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import ReservationInfoForm from '../components/forms/ReservationInfoForm'
import { modifyReservation } from '../queries/reservations'

type InfoModalProps = {
  showInfoModal: boolean
  closeReservationModal: () => void
  reservationRef: React.MutableRefObject<EventImpl | null>
  calendarRef: React.RefObject<FullCalendar>
}

function ReservationInfoModal({
  showInfoModal,
  closeReservationModal,
  reservationRef,
  calendarRef
}: InfoModalProps ) {

  const reservation = reservationRef.current || undefined

  return (
    <Card show={showInfoModal} handleClose={closeReservationModal}>
        <ReservationInfoForm
          id="reservation_info_form"
          reservation={reservationRef.current ?? undefined}
          onSubmit={async (updatedReservation) => {
            console.dir(updatedReservation)
            
            await modifyReservation(
              {
                id: parseInt(reservation!.id, 10),
                start: updatedReservation.start,
                end: updatedReservation.end,
                user: "NYI",
                aircraftId: updatedReservation.aircraftId,
                phone: updatedReservation.phone,
                info: updatedReservation.info,
              }
            )

            closeReservationModal()
            reservationRef.current = null
            calendarRef.current?.getApi().refetchEvents()
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