import React from 'react'
import { useQuery } from 'react-query'
import { sampleQuery } from '../queries/query'
import QueryKeys from '../queries/queryKeys'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'

import interactionPlugin from '@fullcalendar/interaction'

const Calendar = () => {

  const {data, isLoading, isError} = useQuery(QueryKeys.Sample, sampleQuery)

  return(
    <div className='flex flex-col space-y-2 h-full w-full'>
      <h1 className='text-3xl'>Varauskalenteri</h1>
      <FullCalendar
        plugins={[ timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listDay,listWeek'
        }}
        height='100%'
        initialView="timeGridWeek"
        locale='fi'
        allDaySlot={false}
        nowIndicator={true}
        scrollTime='08:00:00'
        dayHeaderFormat={{weekday: 'long'}}
        slotDuration='00:10:00'
        slotLabelInterval={{minutes: 30}}
        slotLabelFormat={{hour:'numeric', minute:'2-digit', hour12:false, meridiem:false}}
        selectable={true}
        editable={true}
        eventColor='#000000'
        eventBackgroundColor='#000000'
      />
    </div>
  )
}

export default Calendar