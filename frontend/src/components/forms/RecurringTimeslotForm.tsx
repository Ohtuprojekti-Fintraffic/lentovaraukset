import React, { useEffect, useState } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  ReservationEntry, TimeslotEntry, TimeslotType, WeekInDays,
} from '@lentovaraukset/shared/src';
import { usePopupContext } from '../../contexts/PopupContext';
import InputField from '../InputField';
import DatePicker from '../DatePicker';
import { HTMLDateTimeConvert } from '../../util';
import { useAirfield } from '../../queries/airfields';
import { getReservations } from '../../queries/reservations';
import ModalAlert from '../ModalAlert';

type RecurringTimeslotProps = {
  timeslot?: EventImpl
  isBlocked: boolean
  draggedTimes?: { start: Date, end: Date }
  onSubmit: (
    formData: Omit<TimeslotEntry, 'id' | 'user'>,
    period?:
    { end: Date,
      periodName: string,
      days: WeekInDays
    }) => void
  id?: string
};

type Inputs = {
  start: string
  end: string
  type: TimeslotType
  info: string | null
  isRecurring: boolean
  periodEnds: string | null
  periodName: string
  days: {
    maanantai: boolean
    tiistai: boolean
    keskiviikko: boolean
    torstai: boolean
    perjantai: boolean
    lauantai: boolean
    sunnuntai: boolean
  }
};

function RecurringTimeslotForm({
  timeslot, draggedTimes, isBlocked,
  onSubmit,
  id,
}: RecurringTimeslotProps) {
  const [reservations, setReservations] = useState<ReservationEntry[]>([]);
  const [formWarning, setFormWarning] = useState<string | undefined>(undefined);
  const { showPopup, clearPopup } = usePopupContext();
  const { data: airfield } = useAirfield('EGLL');
  const timeslotGranularity = airfield?.eventGranularityMinutes || 20;
  const start = timeslot?.startStr.replace(/.{3}\+.*/, '') || HTMLDateTimeConvert(draggedTimes?.start) || '';
  const end = timeslot?.endStr.replace(/.{3}\+.*/, '') || HTMLDateTimeConvert(draggedTimes?.end) || '';

  const {
    register, handleSubmit, reset, watch, control, formState: { errors }, getValues,
  } = useForm<Inputs>({
    values: {
      start,
      end,
      type: timeslot?.extendedProps.type,
      info: null,
      isRecurring: false,
      periodEnds: timeslot?.endStr.replace(/T.*/, '') || '',
      periodName: timeslot?.extendedProps.periodName,
      days: {
        maanantai: true,
        tiistai: true,
        keskiviikko: true,
        torstai: true,
        perjantai: true,
        lauantai: true,
        sunnuntai: true,
      },
    },
  });

  const removesReservations = (type: TimeslotType) => type === 'blocked' && reservations.length > 0;

  const submitHandler: SubmitHandler<Inputs> = async (formData) => {
    const type: TimeslotType = formData.type ?? (isBlocked ? 'blocked' : 'available');
    const updatedTimeslot = {
      start: new Date(formData.start),
      end: new Date(formData.end),
      type,
      info: formData.info,
    };
    const { isRecurring, periodEnds } = formData;
    const submit = () => {
      if (isRecurring && periodEnds) {
        const period = {
          end: new Date(periodEnds),
          periodName: formData.periodName,
          days: {
            monday: formData.days.maanantai,
            tuesday: formData.days.tiistai,
            wednesday: formData.days.keskiviikko,
            thursday: formData.days.torstai,
            friday: formData.days.perjantai,
            saturday: formData.days.lauantai,
            sunday: formData.days.sunnuntai,
          },
        };
        onSubmit(updatedTimeslot, period);
      } else {
        onSubmit(updatedTimeslot);
      }
    };
    if (removesReservations(updatedTimeslot.type)) {
      const onConfirmSubmit = async () => {
        submit();
        clearPopup();
      };
      showPopup({
        popupTitle: 'Oletko varma?',
        popupText: `Vuoron ${timeslot ? 'muokkaaminen' : 'lisääminen'} poistaa seuraavat varaukset: ${reservations.map((r) => r.id).join()}`,
        primaryText: 'Vahvista',
        primaryOnClick: onConfirmSubmit,
        secondaryText: 'Peruuta',
        secondaryOnClick: () => clearPopup(),
      });
    } else submit();
  };
  const onError = (e: any) => console.error(e);

  useEffect(() => {
    reset();
  }, [timeslot]);

  // step is relative to min: https://stackoverflow.com/a/75353708
  // round up to nearest even whatever minutes

  // important detail: the browser GUI doesn't give a damn and will show
  // whatever minutes it wants, but at least Chrome checks the field on submit
  // and shows a popover with the nearest acceptable divisible values

  const showRecurring = watch('isRecurring');

  const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

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
        <form id={id} className="flex flex-col" onSubmit={handleSubmit(submitHandler, onError)}>
          <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-6 w-full">
            <DatePicker
              control={control}
              labelText="Aikaikkuna alkaa:"
              name="start"
              timeGranularityMinutes={timeslotGranularity}
              error={errors.start}
              showTimeSelect
            />
            <DatePicker
              control={control}
              labelText="Aikaikkuna päättyy:"
              name="end"
              timeGranularityMinutes={timeslotGranularity}
              error={errors.end}
              showTimeSelect
            />
          </div>
          {isBlocked && (
            <InputField
              labelText="Lisätietoja:"
              type="text"
              registerReturn={register('info')}
              inputClassName="w-full"
            />
          )}
          {timeslot && (
          <div className="flex flex-col">
            <InputField
              labelText="Määritä toistuvuus"
              type="checkbox"
              registerReturn={register('isRecurring')}
            />
            {showRecurring && (
              <div className="flex flex-row flex-wrap flex-start gap-x-6 gap-y-4 border-[1px] rounded-ft-normal p-4 border-ft-neutral-200 mb-4 overflow-x-auto">
                {['maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai', 'sunnuntai'].map(
                  (day) => (
                    <InputField
                      key={day}
                      labelText={capitalizeFirstLetter(day)}
                      type="checkbox"
                      registerReturn={register(`days.${day}` as keyof Inputs)}
                      inputClassName="mb-0"
                    />
                  ),
                )}
              </div>
            )}
            {showRecurring && (
              <DatePicker
                control={control}
                labelText="Päättyy:"
                name="periodEnds"
                timeGranularityMinutes={timeslotGranularity}
                error={errors.periodEnds}
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
