import React, { useEffect, useState } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReservationValidator } from '@lentovaraukset/shared/src/validation/validation';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import { useAirfield } from '../../queries/airfields';
import InputField from '../InputField';
import { HTMLDateTimeConvert } from '../../util';
import ModalAlert from '../ModalAlert';

type ReservationInfoProps = {
  reservation?: EventImpl
  draggedTimes?: { start: Date, end: Date }
  onSubmit: (formData: Omit<ReservationEntry, 'id' | 'user'>) => void
  id?: string
};

type Inputs = {
  start: string
  end: string
  aircraftId: string
  phone: string
  info: string
};

function ReservationInfoForm({
  reservation, draggedTimes,
  onSubmit,
  id,
}: ReservationInfoProps) {
  const { data: airfield } = useAirfield(1);
  const reservationGranularity = airfield?.eventGranularityMinutes || 20;

  const start = reservation?.startStr.replace(/.{3}\+.*/, '') || HTMLDateTimeConvert(draggedTimes?.start) || '';
  const end = reservation?.endStr.replace(/.{3}\+.*/, '') || HTMLDateTimeConvert(draggedTimes?.end) || '';

  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<Inputs>({
    values: {
      start,
      end,
      aircraftId: reservation?.extendedProps.aircraftId,
      phone: reservation?.extendedProps.phone,
      info: reservation?.extendedProps.info,
    },
    resolver: zodResolver(createReservationValidator(reservationGranularity, 7)),
  });

  const [formWarning, setFormWarning] = useState<string | undefined>(undefined);

  const submitHandler: SubmitHandler<Inputs> = async (formData) => {
    const updatedReservation = {
      start: new Date(formData.start),
      end: new Date(formData.end),
      aircraftId: formData.aircraftId,
      phone: formData.phone,
      info: formData.info,
    };
    setFormWarning(undefined);
    onSubmit(updatedReservation);
  };

  useEffect(() => {
    reset();
  }, [reservation]);

  useEffect(() => {
    // field '' is added to allow access to zod errors not related to a specific field
    setFormWarning((errors as FieldErrors<Inputs & { '': string }>)['']?.message);
  }, [errors]);

  // step is relative to min: https://stackoverflow.com/a/75353708
  const stepSeconds = reservationGranularity * 60;
  const stepMillis = stepSeconds * 1000;
  const nowMillis = new Date().getTime();
  // round up to nearest even whatever minutes
  const roundedDate = new Date(Math.ceil(nowMillis / stepMillis) * stepMillis);
  const min = HTMLDateTimeConvert(roundedDate);

  // important detail: the browser GUI doesn't give a damn and will show
  // whatever minutes it wants, but at least Chrome checks the field on submit
  // and shows a popover with the nearest acceptable divisible values

  // TODO: add max future time
  // const max =

  return (
    <div>
      <div className="bg-black p-3">
        <p className="text-white">
          {
        reservation
          ? `Varaus #${reservation.id}`
          : 'Uusi varaus'
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
        <form id={id} className="flex flex-col w-fit" onSubmit={handleSubmit(submitHandler)}>
          <div className="flex flex-row space-x-6">
            <div className="flex flex-col">
              <InputField
                labelText="Varaus alkaa:"
                type="datetime-local"
                registerReturn={register('start')}
                step={stepSeconds}
                min={min}
                error={errors.start}
              />
              <InputField
                labelText="Koneen rekisteritunnus:"
                type="text"
                registerReturn={register('aircraftId')}
                error={errors.aircraftId}
              />
            </div>
            <div className="flex flex-col">
              <InputField
                labelText="Varaus päättyy:"
                type="datetime-local"
                registerReturn={register('end')}
                step={stepSeconds}
                min={min}
                error={errors.end}
              />
              <InputField
                labelText="Puhelinnumero:"
                type="tel"
                registerReturn={register('phone')}
                error={errors.phone}
              />
            </div>
          </div>
          <InputField
            labelText="Lisätietoja:"
            type="text"
            registerReturn={register('info')}
            inputClassName="w-full"
            error={errors.info}
          />
        </form>
      </div>
    </div>
  );
}

export default ReservationInfoForm;
