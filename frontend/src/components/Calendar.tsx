import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type {
  AllowFunc,
  DateSelectArg, EventContentArg, EventChangeArg, EventClickArg, EventRemoveArg,
  EventSourceInput,
} from '@fullcalendar/core';
import fiLocale from '@fullcalendar/core/locales/fi';
import enLocale from '@fullcalendar/core/locales/en-gb';
import svLocale from '@fullcalendar/core/locales/sv';
import { EventImpl } from '@fullcalendar/core/internal';
import { isTimeInPast, isTimeAtMostInFuture, isTimeFarEnoughInFuture } from '@lentovaraukset/shared/src/validation/validation';
import { ConfigurationEntry } from '@lentovaraukset/shared/src';
import { useTranslation } from 'react-i18next';
import AlertContext from '../contexts/AlertContext';
import Tag from './Tag';

type CalendarProps = {
  calendarRef?: React.RefObject<FullCalendar>
  eventSources: EventSourceInput[];
  addEventFn: (event: { start: Date; end: Date; }) => void;
  modifyEventFn: (event: EventImpl) => Promise<any>;
  clickEventFn: (event: EventImpl) => Promise<void>;
  removeEventFn: (event: EventRemoveArg) => Promise<void>;
  configuration?: ConfigurationEntry;
  granularity: { minutes: number } | undefined;
  eventColors: {
    backgroundColor?: string;
    eventColor?: string;
    textColor?: string;
  } | undefined;
  selectConstraint: string | undefined;
  allowEventRef?: AllowFunc;
  checkIfTimeInFuture?: boolean;
  blocked?: boolean;
};

function EventComponent({ arg }: { arg: EventContentArg }) {
  const isReservation = !!arg.event.extendedProps.aircraftId;
  const isBlocked = arg.event.extendedProps.type === 'blocked';

  if (isReservation && arg.textColor === '#000000') {
    // somewhat hacky way to detect this but
    // when the event is e.g. rendered as
    // a background element we dont want text on it
    return null;
  }

  const startHour = arg.event.start?.getHours().toString().padStart(2, '0');
  const startMins = arg.event.start?.getMinutes().toString().padStart(2, '0');
  const endHour = arg.event.end?.getHours().toString().padStart(2, '0');
  const endMins = arg.event.end?.getMinutes().toString().padStart(2, '0');

  const timeText = `${startHour}:${startMins} - ${endHour}:${endMins}`;

  return (
    <div className="p-1 ">
      <p className="mb-1">
        {timeText}
      </p>
      {isReservation && (
      <Tag
        styleName="id"
        bgColorClassName="bg-ft-neutral-100"
        textColorClassName="text-ft-text-600"
      >
        {arg.event.extendedProps?.aircraftId}
      </Tag>
      )}
      {isBlocked && <p>{ arg.event.extendedProps.info }</p>}
      {/* Not used for reservations because this is probably not something the average user is
          supposed to see, which also brings up the question why the client
          gets everyone's phone number and these infos.
          TODO: look into */}
    </div>
  );
}

function Calendar({
  calendarRef: forwardedCalendarRef,
  eventSources,
  addEventFn,
  modifyEventFn,
  clickEventFn,
  removeEventFn,
  configuration,
  granularity = { minutes: 20 },
  eventColors,
  selectConstraint,
  allowEventRef = () => true,
  checkIfTimeInFuture = false,
  blocked = false,
}: CalendarProps) {
  const calendarRef = forwardedCalendarRef || React.createRef();

  const { t, i18n } = useTranslation();
  // set locale for calendar based on i18n language
  // use a switch statement to avoid typescript errors
  let calendarLocale;
  switch (i18n.language) {
    case 'en':
      calendarLocale = enLocale;
      break;
    case 'sv':
      calendarLocale = svLocale;
      break;
    default:
      calendarLocale = fiLocale;
  }

  const { addNewAlert } = React.useContext(AlertContext);
  const [viewMode, setViewMode] = React.useState(window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek');

  React.useEffect(() => {
    const handleResize = () => {
      const newViewMode = window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek';
      setViewMode(newViewMode);

      if (calendarRef.current) {
        calendarRef.current.getApi().changeView(newViewMode);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calendarRef]);

  const isSameType = (
    stillEventType: string,
    movingEventType?: string,
  ) => {
    if (movingEventType) return stillEventType === movingEventType;
    return ((stillEventType === 'available' && !blocked) || (stillEventType === 'blocked' && blocked));
  };

  const timeIsConsecutive = (start: Date, end: Date, type?: string) => {
    const consecutive = calendarRef.current?.getApi().getEvents().some(
      (e) => (isSameType(e.extendedProps.type, type))
      && e.start && e.end
      && ((start.getTime() !== e.start.getTime()) && (end.getTime() !== e.end.getTime()))
      && (e.start.getTime() === start.getTime()
        || e.start.getTime() === end.getTime()
        || e.end.getTime() === start.getTime()
        || e.end.getTime() === end.getTime()),
    );
    return consecutive;
  };

  const isTimeAllowed = (start: Date, end: Date, type?: string, ignoreStart?: boolean) => {
    if ((!ignoreStart && isTimeInPast(start)) || isTimeInPast(end)) {
      calendarRef.current?.getApi().unselect();
      addNewAlert(t('calendar.notPast'), 'warning');
      return false;
    }
    const maxDaysInFuture = configuration ? configuration.maxDaysInFuture : 7;
    if (checkIfTimeInFuture && !isTimeAtMostInFuture(start, maxDaysInFuture)) {
      calendarRef.current?.getApi().unselect();
      addNewAlert(`${t('calendar.notTooFarFuture.begin')}${maxDaysInFuture}${t('calendar.notTooFarFuture.end')}$`, 'warning');
      return false;
    }
    const daysToStart = configuration ? configuration.daysToStart : 0;
    if (checkIfTimeInFuture && !isTimeFarEnoughInFuture(start, daysToStart)) {
      calendarRef.current?.getApi().unselect();
      addNewAlert(`${t('calendar.notTooSoon.begin')}${daysToStart}${t('calendar.notTooSoon.end')}`, 'warning');
      return false;
    }
    if (timeIsConsecutive(start, end, type)) {
      calendarRef.current?.getApi().unselect();
      addNewAlert(t('calendar.notConsecutive'), 'warning');
      return false;
    }
    return true;
  };

  // When an event box is clicked
  const handleEventClick = async (clickData: EventClickArg) => {
    if (clickData.event.display.includes('background')) return;
    const { event } = clickData;
    await clickEventFn(event);
  };

  // When an event box is moved or resized
  const handleEventChange = async (changeData: EventChangeArg) => {
    // Open confirmation popup here
    const { event, oldEvent } = changeData;

    const eventHasMoved = changeData.oldEvent.start?.getTime() !== event.start?.getTime();
    const isReservation = event.extendedProps.aircraftId !== undefined;

    if (isReservation
      && oldEvent.start && isTimeInPast(oldEvent.start)) {
      changeData.revert();
      addNewAlert(t('calendar.cantModifyPast'), 'warning');
      return;
    }

    if (!isReservation && eventHasMoved
      && oldEvent.start && isTimeInPast(oldEvent.start)) {
      changeData.revert();
      addNewAlert(t('calendar.cantMovePast'), 'warning');
      return;
    }

    if (eventHasMoved && event.start && isTimeInPast(event.start)) {
      changeData.revert();
      addNewAlert(t('calendar.cantMoveToPast'), 'warning');
      return;
    }

    try {
      if (isTimeAllowed(
        event.start || new Date(),
        event.end || new Date(),
        event.extendedProps.type,
        true,
      )) {
        await modifyEventFn(event);
      }
    } catch (exception) {
      changeData.revert();
      addNewAlert('Virhe tapahtui varausta muokatessa', 'warning');
      throw exception;
    } finally {
      calendarRef.current?.getApi().refetchEvents();
    }
  };

  // When a new event is selected (dragged) in the calendar.
  const handleEventCreate = async (dropData: DateSelectArg) => {
    const newStartTime: Date = dropData.start || new Date();
    const newEndime: Date = dropData.end || new Date();

    if (!isTimeAllowed(newStartTime, newEndime)) return;

    addEventFn({
      start: dropData.start,
      end: dropData.end,
    });
    calendarRef.current?.getApi().refetchEvents();
    calendarRef.current?.getApi().unselect();
  };

  const handleEventRemove = async (removeInfo: EventRemoveArg) => {
    const { event } = removeInfo;

    if (!isTimeInPast(event.start || new Date())) {
      await removeEventFn(removeInfo);
    }
    calendarRef.current?.getApi().refetchEvents();
    calendarRef.current?.getApi().unselect();
  };

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin]}
      locale={calendarLocale}
      timeZone="UTC"
      weekNumberCalculation="ISO"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listWeek',
      }}
      height="100%"
      initialView={viewMode}
      allDaySlot={false}
      nowIndicator
      scrollTime="08:00:00"
      dayHeaderFormat={{ weekday: 'long' }}
      slotDuration={granularity}
      snapDuration={granularity}
      slotLabelInterval={{ minutes: 30 }}
      slotLabelFormat={{
        hour: 'numeric', minute: '2-digit', hour12: false, meridiem: false,
      }}
      selectable
      selectMirror
      editable
      eventResizableFromStart
      eventStartEditable
      eventBackgroundColor={eventColors?.backgroundColor || '#FFFFFF'}
      eventColor={eventColors?.eventColor || '#000000'}
      eventTextColor={eventColors?.textColor || '#000000'}
      eventClick={handleEventClick}
      // eslint complains only because the prop name doesn't start with "render"
      // eslint-disable-next-line react/no-unstable-nested-components
      eventContent={(arg) => (<EventComponent arg={arg} />)}
      eventChange={handleEventChange}
      eventRemove={handleEventRemove}
      select={handleEventCreate}
      selectConstraint={selectConstraint}
      eventSources={eventSources}
      slotEventOverlap={false}
      selectAllow={allowEventRef}
      eventAllow={allowEventRef}
    />
  );
}

export default Calendar;
