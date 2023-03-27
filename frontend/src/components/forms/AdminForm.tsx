import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Button from '../Button';
import InputField from '../InputField';

type FormProps = {
  title: string;
};

type Inputs = {
  daysBeforeStart: number;
  maxDaysInFuture: number;
  maxConcurrentFlights: number;
  eventGranularityMinutes: number;
};

function AdminForm({ title }: FormProps) {
  const {
    register, handleSubmit,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => {
    console.log(data);
  };

  return (
    <div>
      <div className="p-8 space-y-4">
        <h1 className="text-3xl">{title}</h1>
        <form className="flex flex-col w-full" onSubmit={handleSubmit(onSubmit)}>
          <InputField
            labelText="Kuinka monta päivää vähintään pitää olla varauksen alkuun:"
            type="number"
            registerReturn={register('daysBeforeStart', {
              valueAsNumber: true,
            })}
            defaultValue="0"
            min={0}
            step={1}
          />
          <InputField
            labelText="Kuinka monta päivää tulevaisuuteen varauksen voi tehdä:"
            type="number"
            registerReturn={register('maxDaysInFuture', {
              valueAsNumber: true,
            })}
            defaultValue="7"
            min={1}
            step={1}
          />
          <InputField
            labelText="Varausikkunan minimikoko minuutteina:"
            type="number"
            registerReturn={register('eventGranularityMinutes', {
              valueAsNumber: true,
            })}
            defaultValue="20"
            step={10}
            min={10}
          />
          <InputField
            labelText="Samanaikaisten varausten maksimimäärä:"
            type="number"
            registerReturn={register('maxConcurrentFlights', {
              valueAsNumber: true,
            })}
            defaultValue="1"
            step={1}
            min={1}
          />
          <Button type="submit" variant="primary">Tallenna</Button>
        </form>
      </div>
    </div>
  );
}

export default AdminForm;
