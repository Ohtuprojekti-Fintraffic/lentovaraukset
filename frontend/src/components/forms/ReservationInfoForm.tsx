import React, { useEffect } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReservationValidator } from '@lentovaraukset/shared/src/validation/validation';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import useAirfield from '../../queries/airfields';

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
  const textFieldStyle = 'border border-black rounded p-1 ml-4';
  const labelStyle = 'flex flex-row justify-between items-center w-full';

  const { data: airfield } = useAirfield(1);
  const reservationGranularity = airfield?.eventGranularityMinutes || 20;

  const {
    register, handleSubmit, reset,
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
    console.dir(formData);

    const updatedReservation = {
      start: new Date(formData.start),
      end: new Date(formData.end),
      aircraftId: formData.aircraftId,
      phone: formData.phone,
      info: formData.info,
    };

    onSubmit(updatedReservation);
  };
  const onError = (e: any) => console.error(e);

  useEffect(() => {
    reset();
  }, [reservation]);

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
          <form id={id} className="flex flex-col w-full space-y-4" onSubmit={handleSubmit(submitHandler, onError)}>
            <div className={labelStyle}>
              <p>
                Varaus alkaa:
              </p>
              <input
                type="datetime-local"
                {...register('start')}
                className={textFieldStyle}
              />
            </div>
            <div className={labelStyle}>
              <p>
                Varaus päättyy:
              </p>
              <input
                type="datetime-local"
                {...register('end')}
                className={textFieldStyle}
              />
            </div>
            <div className={labelStyle}>
              <p>
                Koneen rekisteritunnus:
              </p>
              <input
                type="text"
                {...register('aircraftId')}
                className={textFieldStyle}
              />
            </div>
            <div className={labelStyle}>
              <p>
                Puhelin:
              </p>
              <input
                type="tel"
                {...register('phone')}
                className={textFieldStyle}
              />

            </div>
            <div className={labelStyle}>
              <p>
                Lisätietoja:
              </p>
              <input
                type="text"
                {...register('info')}
                className={textFieldStyle}
              />
            </div>
          </form>
          /* eslint-enable  react/jsx-props-no-spreading */
          )
        }
      </div>
    </div>
  );
}

export default ReservationInfoForm;
