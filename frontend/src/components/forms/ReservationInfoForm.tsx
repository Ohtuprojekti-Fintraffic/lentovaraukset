import React, { useEffect } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { SubmitHandler, useForm } from 'react-hook-form';


type ReservationInfoProps = {
  reservation?: EventImpl
};

type Inputs = {
  start?: string
  end?: string
  info: string
};

function ReservationInfoForm({
  reservation
}: ReservationInfoProps) {
  const textFieldStyle = 'border border-black rounded p-1 ml-4';
  const labelStyle = 'flex flex-row justify-between items-center w-full';

  const {register, handleSubmit, reset, formState: {errors} } = useForm<Inputs>({
    values: {
      start: reservation?.start?.toISOString().replace(/z.*/,''),
      end: reservation?.end?.toISOString().replace(/z.*/,''),
      info: reservation?.extendedProps.aircraftId
    }
  });
  const onSubmit: SubmitHandler<Inputs> = data => {console.dir(data)}

  console.log(reservation?.start?.toISOString().replace(/Z.*/,''))
  console.log(reservation?.end?.toISOString().replace(/Z.*/,''))

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
              Alku:
              <input
                type="datetime-local"
                {...register('start')}
                className={textFieldStyle}
              />
            </label>
            <label className={labelStyle}>
              Loppu:
              <input
                type="datetime-local"
                {...register('end')}
                className={textFieldStyle}
              />
            </label>
            <label className={labelStyle}>
              Info:
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
