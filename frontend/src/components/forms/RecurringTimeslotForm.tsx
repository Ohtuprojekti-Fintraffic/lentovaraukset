import React, { useEffect, useState } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import {
  ReservationEntry, TimeslotEntry, TimeslotType, WeekInDays,
} from '@lentovaraukset/shared/src';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTimeslotFormGroupShape, createTimeSlotValidatorObject, refineTimeslotObject } from '@lentovaraukset/shared/src/validation/validation';
import { useTranslation } from 'react-i18next';
import { usePopupContext } from '../../contexts/PopupContext';
import InputField from '../InputField';
import DatePicker from '../DatePicker';
import { HTMLDateTimeConvert } from '../../util';
import { getReservations } from '../../queries/reservations';
import ModalAlert from '../ModalAlert';
import { useAirportContext } from '../../contexts/AirportContext';

type RecurringTimeslotProps = {
  timeslot?: EventImpl
  isBlocked: boolean
  draggedTimes?: { start: Date, end: Date }
  onSubmit: (
    formData: Omit<TimeslotEntry, 'id' | 'user' | 'airfieldCode'>,
    period?:
    {
      end: Date,
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
  const { t } = useTranslation();

  const { airport } = useAirportContext();
  const [reservations, setReservations] = useState<ReservationEntry[]>([]);
  const [formWarning, setFormWarning] = useState<string | undefined>(undefined);
  const { showPopup, clearPopup } = usePopupContext();
  const timeslotGranularity = airport?.eventGranularityMinutes || 20;

  const {
    register, handleSubmit, reset, watch, control, formState: { errors }, getValues,
  } = useForm<Inputs>({
    // TODO: issue #242 could also remove the need to omit type
    // TODO: make this use the same validation as backend
    resolver: zodResolver(
      refineTimeslotObject(
        createTimeSlotValidatorObject(timeslotGranularity, t) // create object validation
          .omit({ type: true }) // remove type
          .extend(createTimeslotFormGroupShape()), // add group things
        // add periods are not validated
        t,
      ), // refine the object which confirms start < end
    ),
    mode: 'all',
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
        popupTitle: t('timeslots.overlappingPopup.title'),
        popupText: `${t('timeslots.overlappingPopup.text.timeslot')}${timeslot ? t('timeslots.overlappingPopup.text.modifying') : t('timeslots.overlappingPopup.text.adding')} ${t('timeslots.overlappingPopup.text.removes')} ${reservations.map((r) => r.id).join()}`,
        primaryText: t('common.confirm'),
        primaryOnClick: onConfirmSubmit,
        secondaryText: t('common.cancel'),
        secondaryOnClick: () => clearPopup(),
      });
    } else submit();
  };
  const onError = (e: any) => console.error(e);

  useEffect(() => {
    const start = timeslot?.startStr.replace(/.{3}\+.*/, '') || HTMLDateTimeConvert(draggedTimes?.start) || '';
    const end = timeslot?.endStr.replace(/.{3}\+.*/, '') || HTMLDateTimeConvert(draggedTimes?.end) || '';

    reset({
      start,
      end,
      type: timeslot?.extendedProps.type || '',
      info: null,
      isRecurring: false,
      periodEnds: timeslot?.endStr.replace(/T.*/, '') || '',
      days: {
        maanantai: true,
        tiistai: true,
        keskiviikko: true,
        torstai: true,
        perjantai: true,
        lauantai: true,
        sunnuntai: true,
      },
    });
  }, [reset, timeslot, draggedTimes]);

  useEffect(() => {
    // field '' is added to allow access to zod errors not related to a specific field
    setFormWarning((errors as FieldErrors<Inputs & { general?: string }>).general?.message);
  }, [errors]);

  const showRecurring = watch('isRecurring');

  const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const getReservationsWithinTimeslot = async (startTime:Date, endTime: Date) => {
    if (!airport) {
      return;
    }
    setReservations(await getReservations(startTime, endTime, airport.code));
  };

  useEffect(() => {
    const startTime = getValues('start');
    const endTime = getValues('end');
    if (isBlocked || timeslot?.extendedProps.type === 'blocked') getReservationsWithinTimeslot(new Date(startTime)!, new Date(endTime)!);
  }, [watch('end'), watch('start'), draggedTimes]);

  useEffect(() => {
    if (reservations.length > 0) {
      setFormWarning(`${t('timeslots.modal.form.blocked.removes')} ${reservations.map((r) => r.id).join()}`);
    } else setFormWarning(undefined);
  }, [reservations]);

  const dayLiterals = ['maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai', 'sunnuntai'] as const;

  return (
    <>
      <ModalAlert
        message={formWarning}
        variant="warning"
        clearAlert={() => setFormWarning(undefined)}
        removalDelaySecs={10}
      />
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div className="p-8 outline-none" tabIndex={0} aria-label="press tab to enter the time window form">
        <form id={id} className="flex flex-col" onSubmit={handleSubmit(submitHandler, onError)}>
          <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-6 w-full">
            <DatePicker
              control={control}
              labelText={t('timeslots.modal.form.start')}
              name="start"
              timeGranularityMinutes={timeslotGranularity}
              showTimeSelect
              errors={errors}
            />
            <DatePicker
              control={control}
              labelText={t('timeslots.modal.form.end')}
              name="end"
              timeGranularityMinutes={timeslotGranularity}
              showTimeSelect
              errors={errors}
            />
          </div>
          {isBlocked && (
            <InputField
              labelText={t('timeslots.modal.form.details')}
              type="text"
              registerReturn={register('info')}
              inputClassName="w-full"
              errors={errors}
            />
          )}
          {timeslot && (
            <div className="flex flex-col">
              <InputField
                labelText={t('timeslots.modal.form.recurring.repeat')}
                type="checkbox"
                registerReturn={register('isRecurring')}
                errors={errors}
              />
              {showRecurring && (
                <div className="flex flex-row flex-wrap flex-start gap-x-6 gap-y-4 border-[1px] rounded-ft-normal p-4 border-ft-neutral-200 mb-4 overflow-x-auto">
                  {dayLiterals.map(
                    (day) => (
                      <InputField
                        key={day}
                        labelText={capitalizeFirstLetter(day)}
                        type="checkbox"
                        registerReturn={register(`days.${day}`)}
                        inputClassName="mb-0"
                        errors={errors}
                      />
                    ),
                  )}
                </div>
              )}
              {showRecurring && (
                <DatePicker
                  control={control}
                  labelText={t('timeslots.modal.form.recurring.ends')}
                  name="periodEnds"
                  timeGranularityMinutes={timeslotGranularity}
                  errors={errors}
                />
              )}
            </div>
          )}
        </form>
      </div>
    </>
  );
}

export default RecurringTimeslotForm;
