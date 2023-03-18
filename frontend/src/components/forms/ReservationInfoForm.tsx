import React, { useEffect } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReservationValidator } from '@lentovaraukset/shared/src/validation/validation';
import { ReservationEntry } from '@lentovaraukset/shared/src';
import ReactDatePicker from 'react-datepicker';
import { useAirfield } from '../../queries/airfields';
import InputField from '../InputField';
import 'react-datepicker/dist/react-datepicker.css';

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
    register, handleSubmit, reset, control,
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
          <form id={id} className="flex flex-col w-fit" onSubmit={handleSubmit(submitHandler, onError)}>
            <div className="flex flex-row space-x-6">
              <div className="flex flex-col">
                {/* <InputField
                  labelText="Varaus alkaa:"
                  type="datetime-local"
                  registerReturn={register('start')}
                /> */}
                <label
                  className="font-ft-label mb-1"
                >
                  Varaus alkaa:
                </label>
                <Controller
                  control={control}
                  name="start"
                  render={({
                    field: {
                      onChange, value,
                    },
                  }) => {
                    const fieldBaseClass = 'border-[1px] rounded-ft-normal px-4 py-[13px] text-ft-button font-ft-label '
                       + 'placeholder:text-ft-text-300 mb-4';

                    const fieldStateClasses = {
                      default: 'border-ft-neutral-200',
                      error: 'border-[3px] border-ft-danger-200 text-ft-danger-200',
                      disabled: 'border-ft-neutral-200 text-ft-text-300 bg-ft-input-placeholder',
                    };

                    return (
                      <div className="flex flex-col items-start flex-wrap">
                        <ReactDatePicker
                          className={`${fieldBaseClass} ${fieldStateClasses.default}`}
                          dateFormat="d.MM.yyyy HH:mm"
                          dropdownMode="select"
                          minDate={new Date()}
                          onChange={onChange}
                          placeholderText="Click to select time"
                          selected={value ? new Date(value) : null}
                          shouldCloseOnSelect
                          showTimeSelect
                          timeIntervals={reservationGranularity}
                        />
                      </div>
                    );
                  }}
                />
                <InputField
                  labelText="Koneen rekisteritunnus:"
                  type="text"
                  registerReturn={register('aircraftId')}
                />
              </div>
              <div className="flex flex-col">
                <InputField
                  labelText="Varaus päättyy:"
                  type="datetime-local"
                  registerReturn={register('end')}
                />
                <InputField
                  labelText="Puhelinnumero:"
                  type="tel"
                  registerReturn={register('phone')}
                />
              </div>
            </div>
            <InputField
              labelText="Lisätietoja:"
              type="text"
              registerReturn={register('info')}
              inputClassName="w-full"
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
