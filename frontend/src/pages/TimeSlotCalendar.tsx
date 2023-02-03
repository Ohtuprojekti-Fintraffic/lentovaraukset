import React from 'react';
import { useQuery } from 'react-query';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

import interactionPlugin from '@fullcalendar/interaction';
import QueryKeys from '../queries/queryKeys';

function TimeSlotCalendar() {
  
  //const { data: timeSlots, isLoading, isError } = useQuery<any[]>(QueryKeys.TimeSlots, timeslotsListQuery);

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <h1 className="text-3xl">Varattavissa olevat aikaikkunat</h1>
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        locale="fi"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay',
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
        eventBackgroundColor="#000000"
        //events={timeSlots}
      />

    </div>
  );
}

export default TimeSlotCalendar;
