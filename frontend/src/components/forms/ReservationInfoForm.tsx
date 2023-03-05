import React, { useEffect } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { SubmitHandler, useForm } from 'react-hook-form';


type ReservationInfoProps = {
  reservation?: EventImpl
};

type Inputs = {
  start?: string
  end?: string
  aircraftId: string
  phone: string
  info: string
};

function ReservationInfoForm({
  reservation
}: ReservationInfoProps) {
  const textFieldStyle = 'border border-black rounded p-1 ml-4';
  const labelStyle = 'flex flex-row justify-between items-center w-full';

  const {register, handleSubmit, reset, formState: {errors} } = useForm<Inputs>({
    values: {
      start: reservation?.start?.toISOString().replace(/.{7}(?:Z|\+).*/,''),
      end: reservation?.end?.toISOString().replace(/.{7}(?:Z|\+).*/,''),
      aircraftId: reservation?.extendedProps.aircraftId,
      phone: reservation?.extendedProps.phone,
      info: reservation?.extendedProps.info
    }
  });
  const onSubmit: SubmitHandler<Inputs> = data => {console.dir(data)}

  useEffect(() => {
    reset()
  }, [reservation])

  return (
    <div>
      <div className="bg-black p-3">
        <p className="text-white">{
        reservation
        ? `Varaus #${reservation.id}`
        : 'Virhe'
        }</p>
      </div>
      <div className="p-8">
        {
          !reservation &&
          <p>Virhe varausta haettaessa</p>
        }
        {
          reservation &&
          <form className="flex flex-col w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <label className={labelStyle}>
              Varaus alkaa:
              <input
                type="datetime-local"
                {...register('start')}
                className={textFieldStyle}
              />
            </label>
            <label className={labelStyle}>
              Varaus päättyy:
              <input
                type="datetime-local"
                {...register('end')}
                className={textFieldStyle}
              />
            </label>
            <label className={labelStyle}>
              Koneen rekisteritunnus:
              <input
                type="text"
                {...register('aircraftId')}
                className={textFieldStyle}
              />
            </label>
            <label className={labelStyle}>
              Puhelinnumero:
              <input
                type="text"
                {...register('phone')}
                className={textFieldStyle}
              />
            </label>
            <label className={labelStyle}>
              Lisätietoja:
              <input
                type="text"
                {...register('info')}
                className={textFieldStyle}
              />
            </label>
          </form>
        }
      </div>
    </div>
  );
}

export default ReservationInfoForm;
