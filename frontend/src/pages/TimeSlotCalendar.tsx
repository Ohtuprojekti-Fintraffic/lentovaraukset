import {
  EventRemoveArg, EventSourceFunc, AllowFunc, EventInput,
} from '@fullcalendar/core';
import { EventImpl } from '@fullcalendar/core/internal';
import FullCalendar from '@fullcalendar/react';
import React, {
  useState, useRef, useCallback, useEffect,
} from 'react';
import { isTimeInPast } from '@lentovaraukset/shared/src/validation/validation';
import { AirfieldEntry, TimeslotType, WeekInDays } from '@lentovaraukset/shared/src';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Calendar from '../components/Calendar';
import TimeslotInfoModal from '../modals/TimeslotInfoModal';
import { getAirfields } from '../queries/airfields';
import {
  getReservations,
} from '../queries/reservations';
import {
  getTimeSlots, modifyTimeSlot, deleteTimeslot, modifyGroup, deleteGroup,
} from '../queries/timeSlots';
import { usePopupContext } from '../contexts/PopupContext';
import { useAirportContext } from '../contexts/AirportContext';

import AirfieldAccordion from '../components/accordions/AirfieldAccordion';

  type StartEndPair = {
    start: Date;
    end: Date;
  };

function TimeSlotCalendar() {
  const { t } = useTranslation();
  const calendarRef = useRef<FullCalendar>(null);
  const {
    airport, setAirportICAO,
  } = useAirportContext();
  const [airfields, setAirfields] = useState<AirfieldEntry[]>([]);
  const { showPopup, clearPopup } = usePopupContext();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const selectedTimeslotRef = useRef<EventImpl | null>(null);
  const draggedTimesRef = useRef<{ start: Date, end: Date } | null>(null);

  function useEventSources() {
    const timeSlotsSourceFn: EventSourceFunc = useCallback(async (
      { start, end },
      successCallback,
      failureCallback,
    ) => {
      if (!airport) {
        failureCallback(new Error('Airport is not set'));
        return;
      }
      try {
        const timeslots = await getTimeSlots(start, end, airport.code);
        const timeslotsMapped = timeslots.map((timeslot): EventInput => {
          const timeslotEvent: EventInput = {
            ...timeslot,
            id: timeslot.id.toString(),
            editable: !isTimeInPast(timeslot.end),
            color: timeslot.type === 'available' ? '#84cc1680' : '#eec200',
            title: timeslot.type === 'available' ? t('timeslots.calendar.free') : timeslot.info || t('timeslots.calendar.blocked'),
          };
          return timeslotEvent;
        });
        successCallback(timeslotsMapped);
      } catch (error) {
        failureCallback(error as Error);
      }
    }, [airport]);

    const reservationsSourceFn: EventSourceFunc = useCallback(async (
      { start, end },
      successCallback,
      failureCallback,
    ) => {
      if (!airport) {
        failureCallback(new Error('Airport is not set'));
        return;
      }
      try {
        const reservations = await getReservations(start, end, airport?.code);

        const reservationsMapped = reservations.map((reservation) => ({
          ...reservation, id: reservation.id.toString(), groupId: 'reservations', display: 'background', color: '#000000',
        }));

        successCallback(reservationsMapped);
      } catch (error) {
        failureCallback(error as Error);
      }
    }, [airport]);
    return [reservationsSourceFn, timeSlotsSourceFn];
  }
  const [reservationsSourceFn, timeSlotsSourceFn] = useEventSources();
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

  /**
   * Opens timeslot modal, if event is not in past
   * @param event Event that is clicked, dragged or moved
   */
  const clickOrDragTimeslot = async (event: EventImpl): Promise<void> => {
    if (event.end && isTimeInPast(event.end)) {
      return;
    }

    showTimeslotModalFn(event, null);
  };

  const removeTimeSlot = async (removeInfo: EventRemoveArg) => {
    // fullcalendar removes the event early:
    removeInfo.revert();
    if (!airport) {
      return;
    }
    const { event } = removeInfo;
    const start = event.start ?? new Date();

    const removeOneEvent = async () => {
      await deleteTimeslot(Number(event.id), airport.code);
      closeTimeslotModalFn();
      clearPopup();
      calendarRef.current?.getApi().refetchEvents();
    };

    const removeAllFutureEvents = async () => {
      if (event.extendedProps.group) {
        const startingFrom = new Date(start);
        await deleteGroup(event.extendedProps.group, { startingFrom }, airport.code);
      }
      closeTimeslotModalFn();
      clearPopup();
      calendarRef.current?.getApi().refetchEvents();
    };

    const onCancelRemove = () => {
      clearPopup();
    };

    if (event.extendedProps.group) {
      showPopup({
        popupTitle: t('timeslots.repeatingDeletionPopup.title'),
        popupText: t('timeslots.repeatingDeletionPopup.text'),
        primaryText: t('timeslots.repeatingDeletionPopup.primary'),
        primaryOnClick: removeAllFutureEvents,
        secondaryText: t('timeslots.repeatingDeletionPopup.secondary'),
        secondaryOnClick: removeOneEvent,
        tertiaryText: t('common.cancel'),
        tertiaryOnClick: onCancelRemove,
      });
    } else {
      showPopup({
        popupTitle: t('timeslots.deletionPopup.title'),
        popupText: t('timeslots.deletionPopup.text'),
        dangerText: t('common.delete'),
        dangerOnClick: removeOneEvent,
        secondaryText: t('common.cancel'),
        secondaryOnClick: onCancelRemove,
      });
    }
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
    if (!airport) {
      return;
    }
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
        airport.code,
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
        await modifyGroup(
          timeslot.extendedProps.group,
          {
            startingFrom,
            startTimeOfDay: {
              hours: start.getHours(), minutes: start.getMinutes(),
            },
            endTimeOfDay: {
              hours: end.getHours(), minutes: end.getMinutes(),
            },
          },
          airport.code,
        );
      }
      closeTimeslotModalFn();
      clearPopup();
      calendarRef.current?.getApi().refetchEvents();
    };

    if (timeslot.extendedProps.group) {
      showPopup({
        popupTitle: t('timeslots.repeatingPopup.title'),
        popupText: t('timeslots.repeatingPopup.text'),
        primaryText: t('timeslots.repeatingPopup.primary'),
        primaryOnClick: modifyAllFutureEvents,
        secondaryText: t('timeslots.repeatingPopup.secondary'),
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

  useEffect(() => {
    const fetchData = async () => {
      setAirfields(await getAirfields());
    };
    fetchData();
  }, []);

  return (
    <>
      {/* This is outside the div because spacing affects it even though it's a modal */}
      <TimeslotInfoModal
        showInfoModal={showInfoModal}
        timeslot={selectedTimeslotRef?.current || undefined}
        draggedTimes={draggedTimesRef?.current || undefined}
        isBlocked={blocked}
        modifyTimeslotFn={modifyTimeslotFn}
        closeTimeslotModal={() => {
          closeTimeslotModalFn();
          calendarRef.current?.getApi().refetchEvents();
        }}
      />
      <div className="flex flex-col w-full">
        <AirfieldAccordion
          airfield={airport}
          airfields={airfields}
          onChange={(a:AirfieldEntry) => setAirportICAO(a.code)}
        />
        <div className="flex flex-col space-y-2 h-full w-full p-8">
          <div className="flex flex-row justify-between mt-0">
            <h1 className="text-3xl">
              {t('timeslots.calendar.timeslots')}
            </h1>
            <Button variant="primary" onClick={() => showTimeslotModalFn(null, null)}>
              {t('timeslots.calendar.newTimeslot')}
            </Button>
          </div>
          <div>
            <label htmlFor="checkbox" className="font-ft-label mb-1">
              <span>
                {t('timeslots.calendar.blockedTimeslot')}
              </span>
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
            eventSources={[reservationsSourceFn, timeSlotsSourceFn]}
            addEventFn={showModalAfterDrag}
            modifyEventFn={clickOrDragTimeslot}
            clickEventFn={clickOrDragTimeslot}
            removeEventFn={removeTimeSlot}
            granularity={airport && { minutes: airport.eventGranularityMinutes }}
            eventColors={{ backgroundColor: blocked ? '#eec200' : '#bef264', eventColor: blocked ? '#b47324' : '#84cc1680', textColor: '#000000' }}
            selectConstraint={undefined}
            blocked={blocked}
            allowEventRef={allowEvent}
          />
        </div>
      </div>
    </>
  );
}

export default TimeSlotCalendar;
