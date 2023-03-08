import React, { useEffect } from 'react';
import { EventImpl } from '@fullcalendar/core/internal';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TimeslotEntry } from '@lentovaraukset/shared/src';
import InputField from '../InputField';

type RecurringTimeslotProps = {
  timeslot?: EventImpl
  onSubmit: (formData: Omit<TimeslotEntry, 'id' | 'user'>) => void
  id?: string
};

type Inputs = {
  start: string
  end: string
  recurring: string
};

function RecurringTimeslotForm({
  timeslot,
  onSubmit,
  id,
}: RecurringTimeslotProps) {
  const {
    register, handleSubmit, reset,
  } = useForm<Inputs>({
    values: {
      start: timeslot?.startStr.replace(/.{3}\+.*/, '') || '',
      end: timeslot?.endStr.replace(/.{3}\+.*/, '') || '',
      recurring: 'Ei toistu',
    },
  });
  const submitHandler: SubmitHandler<Inputs> = async (formData) => {
    const updatedTimeslot = {
      start: new Date(formData.start),
      end: new Date(formData.end),
      recurring: formData.recurring,
    };

    onSubmit(updatedTimeslot);
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
          /* eslint-disable  react/jsx-props-no-spreading */
          <form id={id} className="flex flex-col w-fit" onSubmit={handleSubmit(submitHandler, onError)}>
            <div className="flex flex-row space-x-6">
              <div className="flex flex-col">
                <InputField
                  labelText="Aikaikkuna alkaa:"
                  type="datetime-local"
                  registerReturn={register('start')}
                />
              </div>
              <div className="flex flex-col">
                <InputField
                  labelText="Aikaikkuna päättyy:"
                  type="datetime-local"
                  registerReturn={register('end')}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <p>
                Toistuvuus:
              </p>
              <select name="recurring-events">
                <option value="none">Ei toistu</option>
                <option value="weekdays">Arkipäivisin</option>
              </select>
            </div>
          </form>
          /* eslint-enable  react/jsx-props-no-spreading */
          )
        }
      </div>
    </div>
  );
}

export default RecurringTimeslotForm;
