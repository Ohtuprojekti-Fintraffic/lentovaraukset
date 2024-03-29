import { AllowFunc, EventRemoveArg, EventSourceFunc } from '@fullcalendar/core';
import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import FullCalendar from '@fullcalendar/react';
import { isTimeInPast } from '@lentovaraukset/shared/src/validation/validation';
import countMostConcurrent from '@lentovaraukset/shared/src/overlap';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import { useTranslation } from 'react-i18next';
import Calendar from '../components/Calendar';
import {
  getReservations,
  modifyReservation,
  deleteReservation,
} from '../queries/reservations';
import { getTimeSlots } from '../queries/timeSlots';
import ReservationInfoModal from '../modals/ReservationInfoModal';
import { getAirfields } from '../queries/airfields';
import { useConfiguration } from '../queries/configurations';
import Button from '../components/Button';
import AlertContext from '../contexts/AlertContext';
import { usePopupContext } from '../contexts/PopupContext';
import { useAirportContext } from '../contexts/AirportContext';
import AirfieldAccordion from '../components/accordions/AirfieldAccordion';

type StartEndPair = {
  start: Date;
  end: Date;
};

function ReservationCalendar() {
  const { t } = useTranslation();

  const [showInfoModal, setShowInfoModal] = useState(false);
  const selectedReservationRef = useRef<EventImpl | null>(null);
  const draggedTimesRef = useRef<{ start: Date, end: Date } | null>(null);
  const calendarRef: React.RefObject<FullCalendar> = React.createRef();

  const { showPopup, clearPopup } = usePopupContext();
  const {
    airport, setAirportICAO,
  } = useAirportContext();
  const [airfields, setAirfields] = useState<AirfieldEntry[]>([]);
  const { data: configuration } = useConfiguration();
  const { addNewAlert } = useContext(AlertContext);
  function useEventSources() {
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
          ...reservation,
          id: reservation.id.toString(),
          title: reservation.aircraftId,
          constraint: 'timeslots',
          extendedProps: {
            user: reservation.user,
            aircraftId: reservation.aircraftId,
            phone: reservation.phone,
            email: reservation.email,
            info: reservation.info,
          },
          editable: !isTimeInPast(reservation.start),
        }));
        successCallback(reservationsMapped);
      } catch (error) {
        failureCallback(error as Error);
      }
    }, [airport]);
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
        const timeslots = await getTimeSlots(start, end, airport?.code);
        const timeslotsMapped = timeslots.map((timeslot) => {
          const display = timeslot.type === 'available' ? 'inverse-background' : 'block';
          const color = timeslot.type === 'available' ? '#2C2C44' : '#B40000';
          const title = timeslot.type === 'available' ? '' : timeslot.info || t('reservations.calendar.notReservable');
          return {
            ...timeslot, id: timeslot.id.toString(), groupId: 'timeslots', display, color, title, editable: false,
          };
        });
        const notReservable = [{
          title: t('reservations.calendar.notReservable'), start, end, display: 'background', color: '#2C2C44', overlap: false,
        }];
        successCallback(timeslotsMapped.length ? timeslotsMapped : notReservable);
      } catch (error) {
        failureCallback(error as Error);
      }
    }, [airport]);
    return [reservationsSourceFn, timeSlotsSourceFn];
  }
  const [reservationsSourceFn, timeSlotsSourceFn] = useEventSources();

  // either or neither, but not both
  function showReservationModalFn(event: EventImpl, times: StartEndPair): never;
  function showReservationModalFn(event: EventImpl | null, times: StartEndPair | null): void;
  function showReservationModalFn(
    event: EventImpl | null,
    times: StartEndPair | null,
  ): void {
    selectedReservationRef.current = event;
    draggedTimesRef.current = times;
    setShowInfoModal(true);
  }

  const closeReservationModalFn = () => setShowInfoModal(false);

  const clickReservation = async (event: EventImpl): Promise<void> => {
    if ((event.end && isTimeInPast(event.end)) || event.groupId === 'timeslots') {
      return;
    }

    showReservationModalFn(event, null);
  };

  const removeReservation = async (removeInfo: EventRemoveArg) => {
    // fullcalendar removes the event early:
    removeInfo.revert();

    if (!airport) {
      return;
    }
    const { event } = removeInfo;

    const onConfirmRemove = async () => {
      const res = await deleteReservation(Number(event.id), airport.code);
      if (res === `Reservation ${selectedReservationRef.current?.id} deleted`) {
        closeReservationModalFn();
        event.remove();
      } else {
        removeInfo.revert();
        throw new Error(t('reservations.calendar.reservationDeletionFailed'));
      }
      clearPopup();
    };

    const onCancelRemove = () => {
      removeInfo.revert();
      clearPopup();
    };

    showPopup({
      popupTitle: t('reservations.deletionPopup.title'),
      popupText: t('reservations.deletionPopup.text'),
      dangerText: t('common.delete'),
      dangerOnClick: onConfirmRemove,
      secondaryText: t('common.cancel'),
      secondaryOnClick: onCancelRemove,
    });
  };

  const modifyReservationFn = async (event: EventImpl): Promise<void> => {
    if (!airport) {
      return;
    }
    const {
      user, aircraftId, phone, email, info,
    } = event.extendedProps;

    const modifiedReservation = await modifyReservation({
      id: parseInt(event.id, 10),
      start: event.start || new Date(),
      end: event.end || new Date(),
      user,
      aircraftId,
      phone,
      email,
      info,
    }, airport.code);
    if (modifiedReservation) {
      addNewAlert(t('reservations.calendar.reservationModified'), 'success');
    }
  };

  const allowEvent: AllowFunc = (span, movingEvent) => {
    const eventsByType = calendarRef.current?.getApi().getEvents()
      .filter((e) => e.id !== movingEvent?.id && !e.display.includes('background')
        && e.start && e.end
        && e.start < span.end && e.end > span.start);

    if (eventsByType?.some((e) => e.extendedProps.type === 'blocked')) return false;
    const mostConcurrent = countMostConcurrent(eventsByType as { start: Date, end: Date }[]);

    return airport ? mostConcurrent < airport.maxConcurrentFlights : false;
  };

  const showModalAfterDrag = (times: StartEndPair) => showReservationModalFn(null, times);

  useEffect(() => {
    const fetchData = async () => {
      setAirfields(await getAirfields());
    };
    fetchData();
  }, []);

  return (
    <>
      {/* This is outside the div because spacing affects it even though it's a modal */}
      <ReservationInfoModal
        showInfoModal={showInfoModal}
        reservation={selectedReservationRef?.current || undefined}
        draggedTimes={draggedTimesRef?.current || undefined}
        configuration={configuration}
        closeReservationModal={() => {
          closeReservationModalFn();
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
            <h1 className="text-3xl">{t('reservations.calendar.title')}</h1>
            <Button variant="primary" onClick={() => showReservationModalFn(null, null)}>
              {t('reservations.calendar.newReservation')}
            </Button>
          </div>
          <Calendar
            calendarRef={calendarRef}
            eventSources={[reservationsSourceFn, timeSlotsSourceFn]}
            addEventFn={showModalAfterDrag}
            modifyEventFn={modifyReservationFn}
            clickEventFn={clickReservation}
            removeEventFn={removeReservation}
            granularity={airport && { minutes: airport.eventGranularityMinutes }}
            eventColors={{ backgroundColor: '#000000', eventColor: '#FFFFFFF', textColor: '#FFFFFFF' }}
            selectConstraint="timeslots"
            checkIfTimeInFuture
            allowEventRef={allowEvent}
            configuration={configuration}
          />
        </div>
      </div>
    </>
  );
}

export default ReservationCalendar;
