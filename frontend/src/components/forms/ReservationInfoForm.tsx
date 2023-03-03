import React from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { SubmitHandler, useForm } from 'react-hook-form';


type ReservationInfoProps = {
  reservation?: EventImpl
};

type Inputs = {
  start: Date
  end: Date
  info: string
};

function ReservationInfoForm({
  reservation
}: ReservationInfoProps) {
  const textFieldStyle = 'border border-black rounded p-1 ml-4';
  const labelStyle = 'flex flex-row justify-between items-center w-full';

  const {register, handleSubmit, formState: {errors} } = useForm<Inputs>({
    defaultValues: {
      start: reservation?.start || undefined,
      end: reservation?.end || undefined,
      info: reservation?.extendedProps.aircraftId
    }
  });
  const onSubmit: SubmitHandler<Inputs> = data => {console.dir(data)}

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
                //type="datetime-local"
                {...register('start')}
                className={textFieldStyle}
              />
            </label>
            <label className={labelStyle}>
              Loppu:
              <input
                //type="datetime-local"
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
