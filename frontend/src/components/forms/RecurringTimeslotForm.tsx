import React, { useEffect, useState } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TimeslotEntry } from '@lentovaraukset/shared/src';
import InputField from '../InputField';

type RecurringTimeslotProps = {
  timeslot?: EventImpl
  onSubmit: (formData: Omit<TimeslotEntry, 'id' | 'user'>,
    period?: { start: Date, end: Date, periodName: string }) => void
  id?: string
};

type Inputs = {
  start: string
  end: string
  isRecurring: boolean
  periodStarts: string | null
  periodEnds: string | null
  periodName: string
};

function RecurringTimeslotForm({
  timeslot,
  onSubmit,
  id,
}: RecurringTimeslotProps) {
  const [showRecurring, setShowRecurring] = useState(false);
  const {
    register, handleSubmit, reset,
  } = useForm<Inputs>({
    values: {
      start: timeslot?.startStr.replace(/.{3}\+.*/, '') || '',
      end: timeslot?.endStr.replace(/.{3}\+.*/, '') || '',
      isRecurring: false,
      periodStarts: timeslot?.startStr.replace(/T.*/, '') || '',
      periodEnds: timeslot?.endStr.replace(/T.*/, '') || '',
      periodName: timeslot?.extendedProps.periodName,
    },
  });
  const submitHandler: SubmitHandler<Inputs> = async (formData) => {
    const updatedTimeslot = {
      start: new Date(formData.start),
      end: new Date(formData.end),
    };
    // TODO: create recurring events if possible
    const { isRecurring, periodStarts, periodEnds } = formData;
    if (isRecurring && periodStarts && periodEnds) {
      const period = {
        start: new Date(periodStarts),
        end: new Date(periodEnds),
        periodName: formData.periodName,
      };
      onSubmit(updatedTimeslot, period);
    } else {
      onSubmit(updatedTimeslot);
    }
  };
  const onError = (e: any) => console.error(e);

  useEffect(() => {
    reset();
  }, [timeslot]);

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
                <InputField
                  labelText="Aikaikkuna alkaa:"
                  type="datetime-local"
                  registerReturn={register('start')}
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
            {showRecurring && (
            <InputField
              labelText="Toistuvuuden nimi"
              type="text"
              registerReturn={register('periodName')}
              inputClassName="w-full"
            />
            )}
          </form>
          )
        }
      </div>
    </div>
  );
}

export default RecurringTimeslotForm;
