import React from 'react';
import { useQuery } from 'react-query';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';

import interactionPlugin from '@fullcalendar/interaction';
import QueryKeys from '../queries/queryKeys';
import {reservationsListQuery} from '../queries/reservationQueries';

function ReservationCalendar() {
  
  const { data: events, isLoading, isError } = useQuery<any[]>(QueryKeys.Reservations, reservationsListQuery);

  const handleEventClick = (clickData: any) => {
    console.log('CLICK');
    console.dir(clickData.event);
  };

  const handleEventChange = (changeData: any) => {
    console.log('CHANGE');
    console.dir(changeData.event);
  };

  const handleEventAdd = (addData: any) => {
    console.log('ADD');
    console.dir(addData.event);
  };

  const handleEventDrop = (dropData: any) => {
    console.log('DROP');
    console.dir(dropData.event);
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <h1 className="text-3xl">Varauskalenteri</h1>
      <FullCalendar
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
        eventClick={handleEventClick}
        eventAdd={handleEventAdd}
        eventChange={handleEventChange}
        select={handleEventDrop}
        events={events}
      />

    </div>
  );
}

export default ReservationCalendar;
