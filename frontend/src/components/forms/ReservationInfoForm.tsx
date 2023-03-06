import React, { useEffect } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { SubmitHandler, useForm } from 'react-hook-form';
import Button from '../Button';


type ReservationInfoProps = {
  reservation?: EventImpl
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
  id
}: ReservationInfoProps) {
  const textFieldStyle = 'border border-black rounded p-1 ml-4';
  const labelStyle = 'flex flex-row justify-between items-center w-full';

  const {register, handleSubmit, reset} = useForm<Inputs>({
    mode: "onSubmit",
    values: {
      start: reservation?.start?.toISOString().replace(/.{7}(?:Z|\+).*/,'') || "",
      end: reservation?.end?.toISOString().replace(/.{7}(?:Z|\+).*/,'') || "",
      aircraftId: reservation?.extendedProps.aircraftId,
      phone: reservation?.extendedProps.phone,
      info: reservation?.extendedProps.info,
    },

  });
  const onSubmit: SubmitHandler<Inputs> = data => {console.dir(data)}
  const onError = (errors: any) => console.error(errors)


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
          <form className="flex flex-col w-full space-y-4" onSubmit={handleSubmit(onSubmit, onError)}>
            <label className={labelStyle}>
              Varaus alkaa:
            </label>
            <input
              type="datetime-local"
              {...register('start')}
              className={textFieldStyle}
            />
            <label className={labelStyle}>
              Varaus päättyy:
            </label>
            <input
              type="datetime-local"
              {...register('end')}
              className={textFieldStyle}
            />
            <label className={labelStyle}>
              Koneen rekisteritunnus:
            </label>
            <input
              type="text"
              {...register('aircraftId')}
              className={textFieldStyle}
            />
            <label className={labelStyle}>
              Puhelin:
            </label>
            <input
              type="tel"
              {...register('phone')}
              className={textFieldStyle}
            />
            <label className={labelStyle}>
              Lisätietoja:
            </label>
            <input
              type="text"
              {...register('info')}
              className={textFieldStyle}
            />
            <Button type='submit' variant='primary'>Submit</Button>
          </form>
        }
      </div>
    </div>
  );
}

export default ReservationInfoForm;
