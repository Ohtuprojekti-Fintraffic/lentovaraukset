import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import Button from '../Button';
import InputField from '../InputField';

type FormProps = {
  airfield: AirfieldEntry | undefined;
  airfieldMutation: any;
};

type Inputs = {
  maxConcurrentFlights: number;
  name: string;
  eventGranularityMinutes: number;
};

function AirfieldForm({
  airfield,
  airfieldMutation,
}: FormProps) {
  const {
    register, handleSubmit,
  } = useForm<Inputs>();

  const airfieldMutator = airfieldMutation();

  const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => {
    airfieldMutator.mutate({
      ...data, id: airfield?.id,
    });
  };

  return (
    <div>
      <div className="p-8">
        <form className="flex flex-col w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <InputField
            labelText="Nimi:"
            type="string"
            registerReturn={register('name')}
            defaultValue={airfield?.name}
          />
          <InputField
            labelText="Varausikkunan minimikoko minuutteina:"
            type="number"
            registerReturn={register('eventGranularityMinutes', {
              valueAsNumber: true,
            })}
            defaultValue={airfield?.eventGranularityMinutes.toString()}
          />
          <InputField
            labelText="Samanaikaisten varausten maksimimäärä:"
            type="number"
            registerReturn={register('maxConcurrentFlights', {
              valueAsNumber: true,
            })}
            defaultValue={airfield?.maxConcurrentFlights.toString()}
          />
          <Button type="submit" variant="primary"> Submit</Button>
        </form>
      </div>
    </div>
  );
}

export default AirfieldForm;
