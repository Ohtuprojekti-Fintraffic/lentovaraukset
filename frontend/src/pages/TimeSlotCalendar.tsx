import {
  EventRemoveArg, EventSourceFunc, AllowFunc, EventInput,
} from '@fullcalendar/core';
import { EventImpl } from '@fullcalendar/core/internal';
import FullCalendar from '@fullcalendar/react';
import React, { useState, useRef } from 'react';
import { isTimeInPast } from '@lentovaraukset/shared/src/validation/validation';
import { TimeslotType, WeekInDays } from '@lentovaraukset/shared/src';
import Button from '../components/Button';
import Calendar from '../components/Calendar';
import TimeslotInfoModal from '../modals/TimeslotInfoModal';
import { useAirfield } from '../queries/airfields';
import {
  getReservations,
} from '../queries/reservations';
import {
  getTimeSlots, modifyTimeSlot, deleteTimeslot, modifyGroup,
} from '../queries/timeSlots';
import { usePopupContext } from '../contexts/PopupContext';

type StartEndPair = {
  start: Date;
  end: Date;
};

function TimeSlotCalendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const { data: airfield } = useAirfield('EFHK'); // TODO: get id from airfield selection
  const { showPopup, clearPopup } = usePopupContext();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const selectedTimeslotRef = useRef<EventImpl | null>(null);
  const draggedTimesRef = useRef<{ start: Date, end: Date } | null>(null);

  const timeSlotsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const timeslots = await getTimeSlots(start, end);
      const timeslotsMapped = timeslots.map((timeslot): EventInput => {
        const timeslotEvent: EventInput = {
          ...timeslot,
          id: timeslot.id.toString(),
          editable: !isTimeInPast(timeslot.end),
          color: timeslot.type === 'available' ? '#84cc1680' : '#eec200',
          title: timeslot.type === 'available' ? 'Vapaa' : timeslot.info || 'Suljettu',
        };
        return timeslotEvent;
      });
      successCallback(timeslotsMapped);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  const reservationsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const reservations = await getReservations(start, end);

      const reservationsMapped = reservations.map((reservation) => ({
        ...reservation, id: reservation.id.toString(), groupId: 'reservations', display: 'background', color: '#000000',
      }));

      successCallback(reservationsMapped);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  const eventsSourceRef = useRef([reservationsSourceFn, timeSlotsSourceFn]);

  // either or neither, but not both
  function showTimeslotModalFn(event: EventImpl, times: StartEndPair): never;
  function showTimeslotModalFn(event: EventImpl | null, times: StartEndPair | null): void;
  function showTimeslotModalFn(
    event: EventImpl | null,
    times: StartEndPair | null,
  ): void {
    selectedTimeslotRef.current = event;
    draggedTimesRef.current = times;
    setShowInfoModal(true);
  }

  const closeTimeslotModalFn = () => setShowInfoModal(false);

  const clickTimeslot = async (event: EventImpl): Promise<void> => {
    if (event.end && isTimeInPast(event.end)) {
      return;
    }

    showTimeslotModalFn(event, null);
  };

  const removeTimeSlot = async (removeInfo: EventRemoveArg) => {
    // fullcalendar removes the event early:
    removeInfo.revert();
    const { event } = removeInfo;

    const onConfirmRemove = async () => {
      await deleteTimeslot(Number(event.id));
      closeTimeslotModalFn();
      clearPopup();
      calendarRef.current?.getApi().refetchEvents();
    };

    const onCancelRemove = () => {
      clearPopup();
    };

    showPopup({
      popupTitle: 'Varausikkunan Poisto',
      popupText: 'Haluatko varmasti poistaa varausikkunan?',
      dangerText: 'Poista',
      dangerOnClick: onConfirmRemove,
      secondaryText: 'Peruuta',
      secondaryOnClick: onCancelRemove,
    });
  };

  const isSameType = (
    stillEventType: TimeslotType,
    movingEventType?: TimeslotType,
  ) => {
    if (movingEventType) return stillEventType === movingEventType;
    return ((stillEventType === 'available' && !blocked) || (stillEventType === 'blocked' && blocked));
  };

  const allowEvent: AllowFunc = (span, movingEvent) => {
    const eventsByType = calendarRef.current?.getApi().getEvents()
      .filter((e) => e.id !== movingEvent?.id && e.groupId !== 'reservations'
      && isSameType(e.extendedProps.type, movingEvent?.extendedProps?.type));

    const overlap = eventsByType?.some(
      (e) => e.start && e.end
        && e.start < span.end && e.end > span.start,
    );
    return !overlap;
  };

  const modifyTimeslotFn = async (
    timeslot: EventImpl,
    period?: {
      end: Date,
      days: WeekInDays,
    },
  ) => {
    const start = timeslot.start ?? new Date();
    const end = timeslot.end ?? new Date();
    const modifyOneEvent = async () => {
      await modifyTimeSlot(
        {
          start,
          end,
          id: Number(timeslot.id),
          type: timeslot.extendedProps.type,
          info: timeslot.extendedProps.info,
        },
        period
          ? {
            end: period.end,
            days: period.days,
          }
          : undefined,
      );
      closeTimeslotModalFn();
      clearPopup();
      calendarRef.current?.getApi().refetchEvents();
    };

    const modifyAllFutureEvents = async () => {
      if (timeslot.extendedProps.group) {
        const startingFrom = new Date(start);
        startingFrom.setHours(0, 0, 0, 0);
        await modifyGroup(timeslot.extendedProps.group, {
          startingFrom,
          startTimeOfDay: {
            hours: start.getHours(), minutes: start.getMinutes(),
          },
          endTimeOfDay: {
            hours: end.getHours(), minutes: end.getMinutes(),
          },
        });
      }
      closeTimeslotModalFn();
      clearPopup();
      calendarRef.current?.getApi().refetchEvents();
    };

    if (timeslot.extendedProps.group) {
      showPopup({
        popupTitle: 'Toistuvan varausikkunan muokkaus',
        popupText: 'Muokkasit toistuvaa varausikkuuna. Muokataanko myös kaikkia tulevia ryhmän varausikkunoita?',
        primaryText: 'Muokkaa kaikkia',
        primaryOnClick: modifyAllFutureEvents,
        secondaryText: 'Muokkaa vain tätä',
        secondaryOnClick: modifyOneEvent,
      });
    } else {
      await modifyOneEvent();
    }
  };

  const handleToggle = () => {
    setBlocked(!blocked);
    calendarRef.current?.getApi().refetchEvents();
  };

  const showModalAfterDrag = (times: StartEndPair) => showTimeslotModalFn(null, times);

  return (
    <>
      {/* This is outside the div because spacing affects it even though it's a modal */}
      <TimeslotInfoModal
        showInfoModal={showInfoModal}
        timeslot={selectedTimeslotRef?.current || undefined}
        draggedTimes={draggedTimesRef?.current || undefined}
        isBlocked={blocked}
        modifyTimeslotFn={modifyTimeslotFn}
        closeTimeslotModal={closeTimeslotModalFn}
      />
      <div className="flex flex-col space-y-2 h-full w-full">

        <div className="flex flex-row justify-between mt-0">
          <h1 className="text-3xl">Vapaat varausikkunat</h1>
          <Button variant="primary" onClick={() => showTimeslotModalFn(null, null)}>Uusi varausikkuna</Button>
        </div>
        <div>
          <label htmlFor="checkbox" className="font-ft-label mb-1">
            <span>Lisää suljettuja vuoroja</span>
            <input
              type="checkbox"
              id="checkbox"
              checked={blocked}
              onChange={handleToggle}
              className="mx-2"
            />
          </label>
        </div>
        <Calendar
          calendarRef={calendarRef}
          eventSources={eventsSourceRef.current}
          addEventFn={showModalAfterDrag}
          modifyEventFn={modifyTimeslotFn}
          clickEventFn={clickTimeslot}
          removeEventFn={removeTimeSlot}
          granularity={airfield && { minutes: airfield.eventGranularityMinutes }}
          eventColors={{ backgroundColor: blocked ? '#eec200' : '#bef264', eventColor: blocked ? '#b47324' : '#84cc1680', textColor: '#000000' }}
          selectConstraint={undefined}
          blocked={blocked}
          allowEventRef={allowEvent}
        />
      </div>
    </>
  );
}

export default TimeSlotCalendar;
