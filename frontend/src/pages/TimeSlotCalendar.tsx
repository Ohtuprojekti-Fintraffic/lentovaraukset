import React, { useEffect, useState } from 'react';
import { QueryClient, useMutation, useQuery } from 'react-query';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';

import interactionPlugin from '@fullcalendar/interaction';
import QueryKeys from '../queries/queryKeys';
import { getTimeSlots, modifyTimeSlot, addTimeSlot, deleteTimeslot } from '../queries/timeSlots';

function TimeSlotCalendar() {
  const calendarRef: React.RefObject<FullCalendar> = React.createRef();

  const [timeRange, setTimeRange] = useState({ start: new Date(), end: new Date() });

  const queryClient = new QueryClient();

  const {
    data: timeSlots, isError, isRefetching, isSuccess, refetch: refetchTimeSlots,
  } = useQuery<any[]>(
    [QueryKeys.TimeSlots, timeRange],
    () => getTimeSlots(timeRange.start, timeRange.end),
  );

  const refreshCalendar = () => {
    const calendar = calendarRef.current?.getApi();
    calendar?.removeAllEventSources();
    calendar?.addEventSource(timeSlots!);
  };

  useEffect(() => {
    if (isSuccess) {
      refreshCalendar();
    }
  }, [isRefetching]);

  const newTimeSlot = useMutation(addTimeSlot, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.TimeSlots);
      refetchTimeSlots();
    },
  });

  const changeTimeSlot = useMutation(modifyTimeSlot, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.TimeSlots);
      refetchTimeSlots();
    },
  });

  const removeTimeslot = useMutation(deleteTimeslot, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.TimeSlots);
      refetchTimeSlots();
    },
  });

  // When a timeslot box is clicked
  const handleTimeSlotClick = (clickData: any) => {
    // until better confirm
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Haluatko varmasti poistaa aikaikkunan?')) {
      removeTimeslot.mutateAsync(clickData.event.id);
    }
    refetchTimeSlots();
    // Open time slot info screen here
    // Refresh calendar if changes were made
  };

  // When a timeslot box is moved or resized
  const handleTimeSlotChange = (changeData: any) => {
    // Open confirmation popup here
    const timeSlot = changeData.event;

    changeTimeSlot.mutateAsync({
      id: timeSlot.id,
      start: timeSlot.start,
      end: timeSlot.end,
    });
    refetchTimeSlots();
  };

  // When a new timeslot is selected (dragged) in the calendar.
  const handleTimeSlotDrop = (dropData: any) => {
    newTimeSlot.mutateAsync({
      start: dropData.startStr,
      end: dropData.endStr,
    });
    const calendar = calendarRef.current?.getApi();
    calendar?.unselect();
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <h1 className="text-3xl">Vapaat varausikkunat</h1>
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
                right: 'dayGridMonth,timeGridWeek,listWeek',
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
              eventOverlap={false}
              eventBackgroundColor="#bef264"
              eventColor="#84cc16"
              eventTextColor="#000000"
              eventClick={handleTimeSlotClick}
              eventChange={handleTimeSlotChange}
              select={handleTimeSlotDrop}
              events={timeSlots}
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

export default TimeSlotCalendar;
