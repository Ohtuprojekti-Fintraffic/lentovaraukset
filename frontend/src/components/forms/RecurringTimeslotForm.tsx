import React, { useEffect } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TimeslotEntry } from '@lentovaraukset/shared/src';
import { DatePicker, InputField } from '../InputField';
import { useAirfield } from '../../queries/airfields';

type RecurringTimeslotProps = {
  timeslot?: EventImpl
  onSubmit: (formData: Omit<TimeslotEntry, 'id' | 'user'>) => void
  id?: string
};

type Inputs = {
  start: string
  end: string
  isRecurring: boolean
  periodStarts: string | null
  periodEnds: string | null
};

function RecurringTimeslotForm({
  timeslot,
  onSubmit,
  id,
}: RecurringTimeslotProps) {
  const { data: airfield } = useAirfield(1);

  const {
    register, handleSubmit, reset, watch, control,
  } = useForm<Inputs>({
    values: {
      start: timeslot?.startStr.replace(/.{3}\+.*/, '') || '',
      end: timeslot?.endStr.replace(/.{3}\+.*/, '') || '',
      isRecurring: false,
      periodStarts: timeslot?.startStr.replace(/T.*/, '') || '',
      periodEnds: timeslot?.endStr.replace(/T.*/, '') || '',
    },
  });
  const submitHandler: SubmitHandler<Inputs> = async (formData) => {
    const updatedTimeslot = {
      start: new Date(formData.start),
      end: new Date(formData.end),
    };
    // TODO: create recurring events if possible
    // const { isRecurring, periodStarts, periodEnds } = formData;
    onSubmit(updatedTimeslot);
  };
  const onError = (e: any) => console.error(e);

  useEffect(() => {
    reset();
  }, [timeslot]);

  const showRecurring = watch('isRecurring');

  return (
    <div>
      <div className="bg-black p-3">
        <p className="text-white">
          {
        timeslot
          ? `Aikaikkuna #${timeslot.id}`
          : 'Virhe'
        }
        </p>
      </div>
      <div className="p-8">
        {
          !timeslot
          && <p>Virhe aikaikkunaa haettaessa</p>
        }
        {
          timeslot
          && (
          <form id={id} className="flex flex-col w-fit" onSubmit={handleSubmit(submitHandler, onError)}>
            <div className="flex flex-row space-x-6">
              <div className="flex flex-col">
                <DatePicker
                  control={control}
                  labelText="Aikaikkuna alkaa:"
                  name="start"
                  timeGranularityMinutes={airfield?.eventGranularityMinutes || 20}
                />
                <InputField
                  labelText="Määritä toistuvuus"
                  type="checkbox"
                  registerReturn={register('isRecurring')}
                />
                {showRecurring && (
                  <InputField
                    labelText="Alkaa:"
                    type="date"
                    inputClassName="w-full"
                    registerReturn={register('periodStarts')}
                  />
                )}
              </div>
              <div className="flex flex-col">
                <DatePicker
                  control={control}
                  labelText="Aikaikkuna päättyy:"
                  name="end"
                  timeGranularityMinutes={airfield?.eventGranularityMinutes || 20}
                />
                <div className="flex-1" />
                {showRecurring && (
                <InputField
                  labelText="Päättyy:"
                  type="date"
                  inputClassName="w-full"
                  registerReturn={register('periodEnds')}
                />
                )}
              </div>
            </div>
          </form>
          )
        }
      </div>
    </div>
  );
}

export default RecurringTimeslotForm;
