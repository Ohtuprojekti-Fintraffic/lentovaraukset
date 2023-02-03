import React from 'react';
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

  const { data: reservations, isLoading, isError, refetch: refetchReservations } = useQuery<any[]>(QueryKeys.Reservations, getReservations);
  
  const newReservation = useMutation(addReservation, {
    onSuccess: () => {
      refreshCalendar()
    }
  })

  // When a reservation box is clicked
  const handleReservationClick = (clickData: any) => {
    console.dir(clickData.event);
    // Open reservation info screen
    // Refresh calendar if changes were made
  };

  // When a reservation box is moved or resized
  const handleReservationChange = (changeData: any) => {
    console.dir(changeData.event);
    // Open confirmation popup
  };

  // When a new reservation is selected (dragged) in the calendar.
  const handleReservationDrop = (dropData: any) => {
    console.dir(dropData);
    newReservation.mutateAsync({
      title: 'test',
      start: dropData.startStr,
      end: dropData.endStr,
    })
  };

  const refreshCalendar = () => {
    queryClient.invalidateQueries(QueryKeys.Reservations)
    refetchReservations()
    const calendar = calendarRef.current?.getApi()
    calendar?.unselect()
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
