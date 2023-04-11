import { AllowFunc, EventRemoveArg, EventSourceFunc } from '@fullcalendar/core';
import React, {
  useState,
  useRef,
  useContext,
  useEffect,
} from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import FullCalendar from '@fullcalendar/react';
import { isTimeInPast } from '@lentovaraukset/shared/src/validation/validation';
import countMostConcurrent from '@lentovaraukset/shared/src/overlap';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import Calendar from '../components/Calendar';
import {
  getReservations,
  modifyReservation,
  deleteReservation,
} from '../queries/reservations';
import { getTimeSlots } from '../queries/timeSlots';
import ReservationInfoModal from '../modals/ReservationInfoModal';
import { getAirfields } from '../queries/airfields';
import Button from '../components/Button';
import AlertContext from '../contexts/AlertContext';
import { usePopupContext } from '../contexts/PopupContext';
import AirfieldAccordion from '../components/accordions/AirfieldAccordion';

function ReservationCalendar() {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const selectedReservationRef = useRef<EventImpl | null>(null);
  const draggedTimesRef = useRef<{ start: Date, end: Date } | null>(null);
  const calendarRef: React.RefObject<FullCalendar> = React.createRef();

  const { showPopup, clearPopup } = usePopupContext();
  const [airfields, setAirfields] = useState<AirfieldEntry[]>([]);
  const [airfield, setAirfield] = useState<AirfieldEntry>();
  // const { data: airfield } = useAirfield('EFHK); // TODO: get id from airfield selection
  const { addNewAlert } = useContext(AlertContext);
  const reservationsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const reservations = await getReservations(start, end);

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
  };

  const timeSlotsSourceFn: EventSourceFunc = async (
    { start, end },
    successCallback,
    failureCallback,
  ) => {
    try {
      const timeslots = await getTimeSlots(start, end);
      const timeslotsMapped = timeslots.map((timeslot) => {
        const display = timeslot.type === 'available' ? 'inverse-background' : 'block';
        const color = timeslot.type === 'available' ? '#2C2C44' : '#B40000';
        const title = timeslot.type === 'available' ? '' : timeslot.info || 'Ei varattavissa';
        return {
          ...timeslot, id: timeslot.id.toString(), groupId: 'timeslots', display, color, title, editable: false,
        };
      });

      const notReservable = [{
        title: 'ei varattavissa', start, end, display: 'background', color: '#2C2C44', overlap: false,
      }];

      successCallback(timeslotsMapped.length ? timeslotsMapped : notReservable);
    } catch (error) {
      failureCallback(error as Error);
    }
  };

  const eventsSourceRef = useRef([reservationsSourceFn, timeSlotsSourceFn]);

  const showReservationModalFn = (reservation: EventImpl | null) => {
    selectedReservationRef.current = reservation;
    setShowInfoModal(true);
  };

  const closeReservationModalFn = () => {
    selectedReservationRef.current = null;
    setShowInfoModal(false);
  };

  const clickReservation = async (event: EventImpl): Promise<void> => {
    if ((event.end && isTimeInPast(event.end)) || event.groupId === 'timeslots') {
      return;
    }

    showReservationModalFn(event);
  };

  const removeReservation = async (removeInfo: EventRemoveArg) => {
    const { event } = removeInfo;

    const onConfirmRemove = async () => {
      const res = await deleteReservation(Number(event.id));
      if (res === `Reservation ${selectedReservationRef.current?.id} deleted`) {
        closeReservationModalFn();
        event.remove();
      } else {
        removeInfo.revert();
        throw new Error('Removing reservation failed');
      }
      clearPopup();
    };

    const onCancelRemove = () => {
      removeInfo.revert();
      clearPopup();
    };

    showPopup({
      popupTitle: 'Varauksen Poisto',
      popupText: 'Haluatko varmasti poistaa varauksen?',
      dangerText: 'Poista',
      dangerOnClick: onConfirmRemove,
      secondaryText: 'Peruuta',
      secondaryOnClick: onCancelRemove,
    });
  };

  const modifyReservationFn = async (event: EventImpl): Promise<void> => {
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
    });
    if (modifiedReservation) {
      addNewAlert('Reservation modified', 'success');
    }
  };

  const allowEvent: AllowFunc = (span, movingEvent) => {
    const eventsByType = calendarRef.current?.getApi().getEvents()
      .filter((e) => e.id !== movingEvent?.id && !e.display.includes('background')
        && e.start && e.end
        && e.start < span.end && e.end > span.start);

    if (eventsByType?.some((e) => e.extendedProps.type === 'blocked')) return false;
    const mostConcurrent = countMostConcurrent(eventsByType as { start: Date, end: Date }[]);

    return airfield ? mostConcurrent < airfield.maxConcurrentFlights : false;
  };

  const showModalAfterDrag = (times: { start: Date, end: Date }) => {
    draggedTimesRef.current = times;
    showReservationModalFn(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      setAirfields(await getAirfields());
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col space-y-2 h-full w-full">
      <ReservationInfoModal
        showInfoModal={showInfoModal}
        reservation={selectedReservationRef?.current || undefined}
        draggedTimes={draggedTimesRef?.current || undefined}
        removeReservation={() => {
          selectedReservationRef.current?.remove();
        }}
        closeReservationModal={() => {
          closeReservationModalFn();
          calendarRef.current?.getApi().refetchEvents();
        }}
      />
      <AirfieldAccordion
        airfield={airfield}
        airfields={airfields}
        onChange={setAirfield}
      />
      <div className="flex flex-row justify-between">
        <h1 className="text-3xl">Varauskalenteri</h1>
        <Button variant="primary" onClick={() => setShowInfoModal(true)}>Uusi varaus</Button>
      </div>
      <Calendar
        calendarRef={calendarRef}
        eventSources={eventsSourceRef.current}
        addEventFn={showModalAfterDrag}
        modifyEventFn={modifyReservationFn}
        clickEventFn={clickReservation}
        removeEventFn={removeReservation}
        granularity={airfield && { minutes: airfield.eventGranularityMinutes }}
        eventColors={{ backgroundColor: '#000000', eventColor: '#FFFFFFF', textColor: '#FFFFFFF' }}
        selectConstraint="timeslots"
        checkIfTimeInFuture
        allowEventRef={allowEvent}
      />
    </div>
  );
}

export default ReservationCalendar;
