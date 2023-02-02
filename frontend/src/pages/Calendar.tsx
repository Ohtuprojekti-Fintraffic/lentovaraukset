import React from 'react'
import { useQuery } from 'react-query'
import sampleQuery from '../queries/query'
import QueryKeys from '../queries/queryKeys'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'

import interactionPlugin from '@fullcalendar/interaction'

const Calendar = () => {
  
  const { data, isLoading, isError } = useQuery(QueryKeys.Sample, sampleQuery);

  const [events, setEvents] = React.useState([
    {
      title: 'test',
      start: '2023-01-31T10:00:00',
      end: '2023-01-31T10:45:00',
    }
  ])

  const handleEventClick = (clickData: any) => {
    console.log(`CLICK: ${clickData.event}`)
  }

  const handleEventChange = (changeData: any) => {
    console.log(`CHANGE: ${changeData.event}`)
  }

  const handleEventAdd = (addData: any) => {
    console.log(`ADD: ${addData.event}`)
  }

  const handleEventRemove = (removeData: any) => {
    console.log(`REMOVE: ${removeData.event}`)
  }

  const handleEventDrop = (dropData: any) => {
    console.log(`DROP: ${dropData.event}`)
  }

  return(
    <div className='flex flex-col space-y-2 h-full w-full'>
      <h1 className='text-3xl'>Varauskalenteri</h1>
      <FullCalendar
        plugins={[ timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin]}
        locale='fi'
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listDay,listWeek'
        }}
        height='100%'
        initialView="timeGridWeek"
        allDaySlot={false}
        nowIndicator={true}
        scrollTime='08:00:00'
        dayHeaderFormat={{weekday: 'long'}}
        slotDuration='00:10:00'
        slotLabelInterval={{minutes: 30}}
        slotLabelFormat={{hour:'numeric', minute:'2-digit', hour12:false, meridiem:false}}
        selectable={true}
        selectMirror={true}
        editable={true}
        eventColor='#000000'
        eventBackgroundColor='#000000'
        eventClick={handleEventClick}
        eventAdd={handleEventAdd}
        eventChange={handleEventChange}
        eventRemove={handleEventRemove}
        select={handleEventDrop}
        events={events}
      />
    </div>
  );
}

export default Calendar;
