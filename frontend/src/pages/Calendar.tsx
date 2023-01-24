import React from 'react'
import { useQuery } from 'react-query'
import { sampleQuery } from '../queries/query'
import QueryKeys from '../queries/queryKeys'
import FullCalendar from '@fullcalendar/react' // must go before plugins
import TimeGridPlugin from '@fullcalendar/timegrid'

const Calendar = () => {

  const {data, isLoading, isError} = useQuery(QueryKeys.Sample, sampleQuery)

  return(
    <div className='flex flex-col space-y-2 h-full'>
      <h1 className='text-3xl'>Calendar</h1>
      <FullCalendar
        plugins={[ TimeGridPlugin ]}
        initialView="timeGridWeek"
        height={'100%'}
      />
    </div>
  )
}

export default Calendar