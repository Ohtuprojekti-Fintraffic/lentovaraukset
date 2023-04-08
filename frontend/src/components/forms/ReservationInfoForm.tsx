import React, { useEffect, useState } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { type FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReservationValidator } from '@lentovaraukset/shared/src/validation/validation';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import { useAirfield } from '../../queries/airfields';
import InputField from '../InputField';
import DatePicker from '../DatePicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  const { data: airfield } = useAirfield('EFHK');
  const reservationGranularity = airfield?.eventGranularityMinutes || 20;

  const start = reservation?.startStr.replace(/.{3}\+.*/, '') || HTMLDateTimeConvert(draggedTimes?.start) || '';
  const end = reservation?.endStr.replace(/.{3}\+.*/, '') || HTMLDateTimeConvert(draggedTimes?.end) || '';

  const {
    register, handleSubmit, reset, control, formState: { errors },
  } = useForm<Inputs>({
    values: {
      start,
      end,
      aircraftId: reservation?.extendedProps.aircraftId,
      phone: reservation?.extendedProps.phone,
      info: reservation?.extendedProps.info,
    },
    resolver: zodResolver(createReservationValidator(reservationGranularity, 7)),
    mode: 'all',
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
    setFormWarning((errors as FieldErrors<Inputs & { general?: string }>).general?.message);
  }, [errors]);
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
        <form id={id} className="flex flex-col w-full" onSubmit={handleSubmit(submitHandler)}>
          <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-6 w-full">
            <DatePicker
              control={control}
              labelText="Varaus alkaa:"
              name="start"
              timeGranularityMinutes={reservationGranularity}
              showTimeSelect
              errors={errors}
            />
            <DatePicker
              control={control}
              labelText="Varaus päättyy:"
              name="end"
              timeGranularityMinutes={reservationGranularity}
              showTimeSelect
              errors={errors}
            />
          </div>
          <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-6 w-full">
            <InputField
              labelText="Koneen rekisteritunnus:"
              type="text"
              registerReturn={register('aircraftId')}
              errors={errors}
            />
            <InputField
              labelText="Puhelinnumero:"
              type="tel"
              registerReturn={register('phone')}
              errors={errors}
            />
          </div>
          <InputField
            labelText="Lisätietoja:"
            type="text"
            registerReturn={register('info')}
            inputClassName="w-full"
            errors={errors}
          />
        </form>
      </div>
    </div>
  );
}

export default ReservationInfoForm;
