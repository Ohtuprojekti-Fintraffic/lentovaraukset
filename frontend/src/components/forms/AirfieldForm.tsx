import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { airfieldValidator } from '@lentovaraukset/shared/src/validation/validation';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import Button from '../Button';
import InputField from '../InputField';

type FormProps = {
  showIdField?: boolean;
  title: string;
  airfield: AirfieldEntry | undefined;
  airfieldMutation: Function;
};

type Inputs = {
  code: string;
  maxConcurrentFlights: number;
  name: string;
  eventGranularityMinutes: number;
};

function AirfieldForm({
  showIdField = false,
  title,
  airfield,
  airfieldMutation,
}: FormProps) {
  const {
    register, handleSubmit, formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(airfieldValidator()),
    mode: 'all',
  });

  const airfieldMutator = airfieldMutation();

  const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => {
    const code = data.code ? data.code : airfield?.code;
    airfieldMutator.mutate({ ...data, code });
  };

  return (
    <div>
      <div className="p-8 space-y-4">
        <h1 className="text-3xl">{title}</h1>
        <form className="flex flex-col w-full" onSubmit={handleSubmit(onSubmit)}>
          {showIdField && (
          <InputField
            labelText="Id:"
            type="string"
            registerReturn={register('code')}
            defaultValue={airfield?.code}
            error={errors.code}
          />
          )}
          <InputField
            labelText="Nimi:"
            type="string"
            registerReturn={register('name')}
            defaultValue={airfield?.name}
            error={errors.name}
          />
          <InputField
            labelText="Varausikkunan minimikoko minuutteina:"
            type="number"
            registerReturn={register('eventGranularityMinutes', {
              valueAsNumber: true,
            })}
            defaultValue={airfield?.eventGranularityMinutes.toString()}
            step={10}
            min={10}
            error={errors.eventGranularityMinutes}
          />
          <InputField
            labelText="Samanaikaisten varausten maksimimäärä:"
            type="number"
            registerReturn={register('maxConcurrentFlights', {
              valueAsNumber: true,
            })}
            defaultValue={airfield?.maxConcurrentFlights.toString()}
            step={1}
            min={1}
            error={errors.maxConcurrentFlights}
          />
          <Button type="submit" variant="primary">Tallenna</Button>
        </form>
      </div>
    </div>
  );
}

export default AirfieldForm;
