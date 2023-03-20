import React, { useEffect } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReservationValidator } from '@lentovaraukset/shared/src/validation/validation';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import { useAirfield } from '../../queries/airfields';
import InputField from '../InputField';

type ReservationInfoProps = {
  reservation?: EventImpl
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
  reservation,
  onSubmit,
  id,
}: ReservationInfoProps) {
  const { data: airfield } = useAirfield(1);
  const reservationGranularity = airfield?.eventGranularityMinutes || 20;

  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<Inputs>({
    values: {
      start: reservation?.startStr.replace(/.{3}\+.*/, '') || '',
      end: reservation?.endStr.replace(/.{3}\+.*/, '') || '',
      aircraftId: reservation?.extendedProps.aircraftId,
      phone: reservation?.extendedProps.phone,
      info: reservation?.extendedProps.info,
    },
    resolver: zodResolver(createReservationValidator(reservationGranularity, 7)),
  });

  const submitHandler: SubmitHandler<Inputs> = async (formData) => {
    const updatedReservation = {
      start: new Date(formData.start),
      end: new Date(formData.end),
      aircraftId: formData.aircraftId,
      phone: formData.phone,
      info: formData.info,
    };

    onSubmit(updatedReservation);
  };

  useEffect(() => {
    reset();
  }, [reservation]);

  const onError = (errorObject: FieldErrors) => {
    console.error(errorObject);
  };

  return (
    <div>
      <div className="bg-black p-3">
        <p className="text-white">
          {
            reservation
              ? `Varaus #${reservation.id}`
              : 'Virhe'
          }
        </p>
      </div>
      <div className="p-8">
        {
          !reservation
          && <p>Virhe varausta haettaessa</p>
        }
        {
          reservation
          && (
            /* eslint-disable  react/jsx-props-no-spreading */
            <form id={id} className="flex flex-col w-fit" onSubmit={handleSubmit(submitHandler, onError)}>
              <div className="flex flex-row space-x-6">
                <div className="flex flex-col">
                  <InputField
                    labelText="Varaus alkaa:"
                    type="datetime-local"
                    registerReturn={register('start')}
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
            /* eslint-enable  react/jsx-props-no-spreading */
          )
        }
      </div>
    </div>
  );
}

export default ReservationInfoForm;
