import React, { useEffect, useState } from 'react';
import { QueryClient, useMutation, useQuery } from 'react-query';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';

import interactionPlugin from '@fullcalendar/interaction';
import QueryKeys from '../queries/queryKeys';
import {
  getReservations,
  addReservation,
  modifyReservation,
  deleteReservation,
} from '../queries/reservations';

function ReservationCalendar() {
  const calendarRef: React.RefObject<FullCalendar> = React.createRef();

  const [timeRange, setTimeRange] = useState({ start: new Date(), end: new Date() });

  const queryClient = new QueryClient();

  const {
    data: reservations, isError, isRefetching, isSuccess, refetch: refetchReservations,
  } = useQuery<any[]>(
    [QueryKeys.Reservations, timeRange],
    () => getReservations(timeRange.start, timeRange.end),
  );

  const refreshCalendar = () => {
    const calendar = calendarRef.current?.getApi();
    calendar?.removeAllEventSources();
    calendar?.addEventSource(reservations!);
  };

  useEffect(() => {
    if (isSuccess) {
      refreshCalendar();
    }
  }, [isRefetching]);

  const newReservation = useMutation(addReservation, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.Reservations);
      refetchReservations();
    },
  });

  const changeReservation = useMutation(modifyReservation, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.Reservations);
      refetchReservations();
    },
  });

  const removeReservation = useMutation(deleteReservation, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.DeleteReservation);
      refetchReservations();
    },
  });

  // When a reservation box is clicked
  const handleReservationClick = (clickData: any) => {
    // untill better confirm
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Haluatko varmasti poistaa varauksen?')) {
      removeReservation.mutateAsync(clickData.event.id);
    }
    refetchReservations();
    // setSelected(clickData.event);
    // Open reservation info screen here
    // Refresh calendar if changes were made
  };

  // When a reservation box is moved or resized
  const handleReservationChange = (changeData: any) => {
    // Open confirmation popup here
    changeReservation.mutateAsync(changeData.event);
    refetchReservations();
  };

  // When a new reservation is selected (dragged) in the calendar.
  const handleReservationDrop = (dropData: any) => {
    newReservation.mutateAsync({
      start: dropData.startStr,
      end: dropData.endStr,
      aircraftId: '',
      info: '',
    });
    const calendar = calendarRef.current?.getApi();
    calendar?.unselect();
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <h1 className="text-3xl">Varauskalenteri</h1>
      {
        !isError
          ? (
            <FullCalendar
              ref={calendarRef}
              plugins={[timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin]}
              locale="fi"
              weekNumberCalculation="ISO"
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
              eventBackgroundColor="#000000"
              eventClick={handleReservationClick}
              eventChange={handleReservationChange}
              select={handleReservationDrop}
              events={reservations}
              datesSet={(dateInfo) => {
                setTimeRange({ start: dateInfo.start, end: dateInfo.end });
              }}
            />
          )
          : <p>Virhe noutaessa varauksia</p>
      }
    </div>
  );
}

export default ReservationCalendar;
