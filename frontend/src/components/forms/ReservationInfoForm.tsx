import { EventImpl } from '@fullcalendar/core/internal';
import React from 'react';

type ReservationInfoProps = {
  reservation?: EventImpl
};

function ReservationInfoForm({
  reservation,
}: ReservationInfoProps) {
  const textFieldStyle = 'border border-black rounded p-1 ml-4';
  const labelStyle = 'flex flex-row justify-between items-center w-full';

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
          <form className="flex flex-col w-full space-y-4">
            <label className={labelStyle}>
              Alku:
              <input
                type="datetime-local"
                defaultValue={reservation.start?.toISOString()}
                className={textFieldStyle}
              />
            </label>
            <label className={labelStyle}>
              Loppu:
              <input
                type="datetime-local"
                defaultValue={reservation.end?.toISOString()}
                className={textFieldStyle}
              />
            </label>
            <label className={labelStyle}>
              Info:
              <input
                type="text"
                defaultValue={reservation.title}
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
