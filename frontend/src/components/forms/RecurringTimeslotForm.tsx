import React, { useEffect, useState } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ReservationEntry, TimeslotEntry, TimeslotType } from '@lentovaraukset/shared/src';
import { usePopupContext } from '../../contexts/PopupContext';
import InputField from '../InputField';
import { HTMLDateTimeConvert } from '../../util';
import { useAirfield } from '../../queries/airfields';
import { getReservations } from '../../queries/reservations';
import ModalAlert from '../ModalAlert';

type RecurringTimeslotProps = {
  timeslot?: EventImpl
  isBlocked: boolean
  draggedTimes?: { start: Date, end: Date }
  onSubmit: (formData: Omit<TimeslotEntry, 'id' | 'user'>, period?: { end: Date, periodName: string }) => void
  id?: string
};

type Inputs = {
  start: string
  end: string
  type: TimeslotType
  isRecurring: boolean
  periodEnds: string | null
  periodName: string
};

function RecurringTimeslotForm({
  timeslot, draggedTimes, isBlocked,
  onSubmit,
  id,
}: RecurringTimeslotProps) {
  const [reservations, setReservations] = useState<ReservationEntry[]>([]);
  const [formWarning, setFormWarning] = useState<string | undefined>(undefined);
  const { showPopup, clearPopup } = usePopupContext();
  const { data: airfield } = useAirfield(1);
  const timeslotGranularity = airfield?.eventGranularityMinutes || 20;
  const start = timeslot?.startStr.replace(/.{3}\+.*/, '') || HTMLDateTimeConvert(draggedTimes?.start) || '';
  const end = timeslot?.endStr.replace(/.{3}\+.*/, '') || HTMLDateTimeConvert(draggedTimes?.end) || '';

  const {
    register, handleSubmit, reset, watch, getValues,
  } = useForm<Inputs>({
    values: {
      start,
      end,
      type: timeslot?.extendedProps.type,
      isRecurring: false,
      periodEnds: timeslot?.endStr.replace(/T.*/, '') || '',
      periodName: timeslot?.extendedProps.periodName,
    },
  });

  const removesReservations = (type: TimeslotType) => type === 'blocked' && reservations.length > 0;

  const submitHandler: SubmitHandler<Inputs> = async (formData) => {
    const type: TimeslotType = formData.type ?? (isBlocked ? 'blocked' : 'available');
    const updatedTimeslot = {
      start: new Date(formData.start),
      end: new Date(formData.end),
      type,
    };
    const { isRecurring, periodEnds } = formData;
    const submit = () => {
      if (isRecurring && periodEnds) {
        const period = {
          end: new Date(periodEnds),
          periodName: formData.periodName,
        };
        onSubmit(updatedTimeslot, period);
      } else {
        onSubmit(updatedTimeslot);
      }
    };
    if (removesReservations(updatedTimeslot.type)) {
      const onConfirmSubmit = async () => {
        if (isRecurring && periodEnds) {
          submit();
          clearPopup();
        }
      };
      const onCancelSubmit = () => {
        clearPopup();
      };
      showPopup({
        popupTitle: 'Oletko varma?',
        popupText: `Vuoron ${timeslot ? 'muokkaaminen' : 'lisääminen'} poistaa seuraavat varaukset: ${reservations.map((r) => r.id).join()}`,
        primaryText: timeslot ? 'Muokkaa' : 'Lisää',
        primaryOnClick: onConfirmSubmit,
        secondaryText: 'Peruuta',
        secondaryOnClick: onCancelSubmit,
      });
    } else submit();
  };
  const onError = (e: any) => console.error(e);

  useEffect(() => {
    reset();
  }, [timeslot]);

  // step is relative to min: https://stackoverflow.com/a/75353708
  const stepSeconds = timeslotGranularity * 60;
  const stepMillis = stepSeconds * 1000;
  const nowMillis = new Date().getTime();
  // round up to nearest even whatever minutes
  const roundedDate = new Date(Math.ceil(nowMillis / stepMillis) * stepMillis);
  const min = HTMLDateTimeConvert(roundedDate);

  // important detail: the browser GUI doesn't give a damn and will show
  // whatever minutes it wants, but at least Chrome checks the field on submit
  // and shows a popover with the nearest acceptable divisible values

  const showRecurring = watch('isRecurring');

  const getReservationsWithinTimeslot = async (startTime:Date, endTime: Date) => {
    setReservations(await getReservations(startTime, endTime));
  };

  useEffect(() => {
    const startTime = getValues('start');
    const endTime = getValues('end');
    if (isBlocked || timeslot?.extendedProps.type === 'blocked') getReservationsWithinTimeslot(new Date(startTime)!, new Date(endTime)!);
  }, [watch('end'), watch('start'), draggedTimes]);

  useEffect(() => {
    if (reservations.length > 0) {
      setFormWarning(`Poistaa varaukset: ${reservations.map((r) => r.id).join()}`);
    } else setFormWarning(undefined);
  }, [reservations]);

  return (
    <div>
      <div className="bg-black p-3">
        <p className="text-white">
          {
        timeslot
          ? `Aikaikkuna #${timeslot.id}`
          : 'Uusi aikaikkuna'
        }
        </p>
      </div>
      <ModalAlert
        message={formWarning}
        variant="warning"
        clearAlert={() => setFormWarning(undefined)}
        removalDelaySecs={10}
      />
      <div className="p-8">
        <form id={id} className="flex flex-col w-fit" onSubmit={handleSubmit(submitHandler, onError)}>
          <div className="flex flex-row space-x-6">
            <div className="flex flex-col">
              <InputField
                labelText="Aikaikkuna alkaa:"
                type="datetime-local"
                registerReturn={register('start')}
                step={stepSeconds}
                min={min}
              />
            </div>
            <div className="flex flex-col">
              <InputField
                labelText="Aikaikkuna päättyy:"
                type="datetime-local"
                registerReturn={register('end')}
                step={stepSeconds}
                min={min}
              />
            </div>
          </div>
          {timeslot && (
          <div className="flex flex-col">
            <InputField
              labelText="Määritä toistuvuus"
              type="checkbox"
              registerReturn={register('isRecurring')}
            />
            {showRecurring && (
            <InputField
              labelText="Päättyy:"
              type="date"
              inputClassName="w-full"
              registerReturn={register('periodEnds')}
            />
            )}
            {showRecurring && (
            <InputField
              labelText="Toistuvuuden nimi"
              type="text"
              registerReturn={register('periodName')}
              inputClassName="w-full"
            />
            )}
          </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default RecurringTimeslotForm;
