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
    register, handleSubmit, formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      daysBeforeStart: 0,
      maxDaysInFuture: 7,
      eventGranularityMinutes: 20,
      maxConcurrentFlights: 1,
    },
    mode: 'all',
    // resolver: ,
  });

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
            min={0}
            step={1}
            errors={errors}
          />
          <InputField
            labelText="Kuinka monta päivää tulevaisuuteen varauksen voi tehdä:"
            type="number"
            registerReturn={register('maxDaysInFuture', {
              valueAsNumber: true,
            })}
            min={1}
            step={1}
            errors={errors}
          />
          <InputField
            labelText="Varausikkunan minimikoko minuutteina:"
            type="number"
            registerReturn={register('eventGranularityMinutes', {
              valueAsNumber: true,
            })}
            step={10}
            min={10}
            errors={errors}
          />
          <InputField
            labelText="Samanaikaisten varausten maksimimäärä:"
            type="number"
            registerReturn={register('maxConcurrentFlights', {
              valueAsNumber: true,
            })}
            step={1}
            min={1}
            errors={errors}
          />
          <Button type="submit" variant="primary">Tallenna</Button>
        </form>
      </div>
    </div>
  );
}

export default AdminForm;
