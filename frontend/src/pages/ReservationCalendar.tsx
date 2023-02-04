import React, { useEffect } from 'react';
import { QueryClient, useMutation, useQuery } from 'react-query';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';

import interactionPlugin from '@fullcalendar/interaction';
import QueryKeys from '../queries/queryKeys';
import { getReservations, addReservation } from '../queries/reservationQueries';

function ReservationCalendar() {

  const calendarRef: React.RefObject<FullCalendar> = React.createRef()

  const queryClient = new QueryClient()

  const { data: reservations, isLoading, isError, isRefetching, isSuccess, refetch: refetchReservations } = useQuery<any[]>(QueryKeys.Reservations, getReservations);

  useEffect(() => {
    if (isSuccess) {
      refreshCalendar()
    }
  }, [isRefetching])

  const newReservation = useMutation(addReservation, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.Reservations)
      refetchReservations()
    }
  })

  // When a reservation box is clicked
  const handleReservationClick = (clickData: any) => {
    // Open reservation info screen
    // Refresh calendar if changes were made
  };

  // When a reservation box is moved or resized
  const handleReservationChange = (changeData: any) => {
    // Open confirmation popup
    confirm('are you sure?') ?
    refetchReservations() :
    refreshCalendar()
  };

  // When a new reservation is selected (dragged) in the calendar.
  const handleReservationDrop = (dropData: any) => {
    newReservation.mutateAsync({
      title: 'test',
      start: dropData.startStr,
      end: dropData.endStr,
    })
    const calendar = calendarRef.current?.getApi()
    calendar?.unselect()
  };

  const refreshCalendar = () => {
    const calendar = calendarRef.current?.getApi()
    calendar?.removeAllEventSources()
    calendar?.addEventSource(reservations!)
  }

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <h1 className="text-3xl">Varauskalenteri</h1>
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin]}
        locale="fi"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listDay,listWeek',
        }}
        height="100%"
        initialView="timeGridWeek"
        allDaySlot={false}
        nowIndicator
        scrollTime="08:00:00"
        dayHeaderFormat={{ weekday: 'long' }}
        slotDuration="00:10:00"
        slotLabelInterval={{ minutes: 30 }}
        slotLabelFormat={{
          hour: 'numeric', minute: '2-digit', hour12: false, meridiem: false,
        }}
        selectable
        selectMirror
        editable
        eventResizableFromStart
        eventStartEditable
        eventColor="#000000"
        eventBackgroundColor="#000000"
        eventClick={handleReservationClick}
        eventChange={handleReservationChange}
        select={handleReservationDrop}
        events={reservations}
      />

    </div>
  );
}

export default ReservationCalendar;
