import {
  EventRemoveArg, EventSourceFunc, AllowFunc, EventInput,
} from '@fullcalendar/core';
import { EventImpl } from '@fullcalendar/core/internal';
import FullCalendar from '@fullcalendar/react';
import React, { useState, useRef } from 'react';
import { isTimeInPast } from '@lentovaraukset/shared/src/validation/validation';
import { TimeslotType } from '@lentovaraukset/shared/src';
import Button from '../components/Button';
import Calendar from '../components/Calendar';
import TimeslotInfoModal from '../modals/TimeslotInfoModal';
import { useAirfield } from '../queries/airfields';
import {
  getReservations,
} from '../queries/reservations';
import {
  getTimeSlots, modifyTimeSlot, deleteTimeslot,
} from '../queries/timeSlots';
import { usePopupContext } from '../contexts/PopupContext';

function TimeSlotCalendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const { data: airfield } = useAirfield('EGLL'); // TODO: get id from airfield selection
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
        return timeslot.group ? { ...timeslotEvent, groupId: timeslot.group } : timeslotEvent;
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

  const showTimeslotModalFn = (event: EventImpl | null) => {
    selectedTimeslotRef.current = event;
    setShowInfoModal(true);
  };

  const closeTimeslotModalFn = () => {
    selectedTimeslotRef.current = null;
    setShowInfoModal(false);
  };

  const clickTimeslot = async (event: EventImpl): Promise<void> => {
    if (event.end && isTimeInPast(event.end)) {
      return;
    }

    showTimeslotModalFn(event);
  };

  const removeTimeSlot = async (removeInfo: EventRemoveArg) => {
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
      primaryText: 'Poista',
      primaryOnClick: onConfirmRemove,
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
    event: {
      id: string,
      start: Date,
      end: Date,
      extendedProps: { type: TimeslotType, info: string | null },
    },
  ) => {
    await modifyTimeSlot({
      ...event,
      id: Number(event.id),
      type: event.extendedProps.type,
      info: event.extendedProps.info,
    });
  };

  const handleToggle = () => {
    setBlocked(!blocked);
    calendarRef.current?.getApi().refetchEvents();
  };

  const showModalAfterDrag = (times: { start: Date, end: Date }) => {
    draggedTimesRef.current = times;
    showTimeslotModalFn(null);
  };

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <TimeslotInfoModal
        showInfoModal={showInfoModal}
        timeslot={selectedTimeslotRef?.current || undefined}
        draggedTimes={draggedTimesRef?.current || undefined}
        isBlocked={blocked}
        removeTimeslot={() => {
          selectedTimeslotRef.current?.remove();
        }}
        closeTimeslotModal={() => {
          closeTimeslotModalFn();
          calendarRef.current?.getApi().refetchEvents();
        }}
      />

      <div className="flex flex-row justify-between">
        <h1 className="text-3xl">Vapaat varausikkunat</h1>
        <Button variant="primary" onClick={() => setShowInfoModal(true)}>Uusi varausikkuna</Button>
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
  );
}

export default TimeSlotCalendar;
