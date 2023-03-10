import React, { useEffect, useState } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TimeslotEntry } from '@lentovaraukset/shared/src';
import InputField from '../InputField';
import { HTMLDateTimeConvert } from '../../util';
import useAirfield from '../../queries/airfields';

type RecurringTimeslotProps = {
  timeslot?: EventImpl
  draggedTimes?: { start: Date, end: Date }
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
  timeslot, draggedTimes,
  onSubmit,
  id,
}: RecurringTimeslotProps) {
  const { data: airfield } = useAirfield(1);
  const timeslotGranularity = airfield?.eventGranularityMinutes || 20;
  const [showRecurring, setShowRecurring] = useState(false);

  const start = timeslot?.startStr.replace(/.{3}\+.*/, '') || HTMLDateTimeConvert(draggedTimes?.start) || '';
  const end = timeslot?.endStr.replace(/.{3}\+.*/, '') || HTMLDateTimeConvert(draggedTimes?.end) || '';

  const {
    register, handleSubmit, reset,
  } = useForm<Inputs>({
    values: {
      start,
      end,
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

  // step is relative to min: https://stackoverflow.com/a/75353708
  const stepSeconds = timeslotGranularity * 60;
  const stepMillis = stepSeconds * 1000;
  const nowMillis = new Date().getTime();
  // round up to nearest even whatever minutes
  const roundedDate = new Date(Math.ceil(nowMillis / stepMillis) * stepMillis);
  const min = HTMLDateTimeConvert(roundedDate);

  // important detail: the browser GUI doesn't give a damn and will show
  // whatever minutes it wants, but at least Chrome checks the field on submit
  // and shows a popover with the nearest acceptable divisible values

  return (
    <div>
      <div className="bg-black p-3">
        <p className="text-white">
          {
        timeslot
          ? `Aikaikkuna #${timeslot.id}`
          : 'Uusi aikaikkuna'
        }
        </p>
      </div>
      <div className="p-8">
        <form id={id} className="flex flex-col w-fit" onSubmit={handleSubmit(submitHandler, onError)}>
          <div className="flex flex-row space-x-6">
            <div className="flex flex-col">
              <InputField
                labelText="Aikaikkuna alkaa:"
                type="datetime-local"
                registerReturn={register('start')}
                step={stepSeconds}
                min={min}
              />
              <InputField
                labelText="Määritä toistuvuus"
                type="checkbox"
                onChange={() => setShowRecurring(!showRecurring)}
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
              <InputField
                labelText="Aikaikkuna päättyy:"
                type="datetime-local"
                registerReturn={register('end')}
                step={stepSeconds}
                min={min}
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
      </div>
    </div>
  );
}

export default RecurringTimeslotForm;
