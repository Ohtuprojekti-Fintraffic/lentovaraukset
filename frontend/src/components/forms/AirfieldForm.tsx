import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import Button from '../Button';

type FormProps = {
  airfield: AirfieldEntry;
};

type Inputs = {
  maxFlights?: number;
};

function AirfieldForm(
  { airfield }: FormProps,
) {
  const {
    register, handleSubmit,
  } = useForm<Inputs>({
    defaultValues: {
      maxFlights: airfield.maxConcurrentFlights,
    }
  });
  const textFieldStyle = 'border border-black rounded p-1 ml-4';
  const labelStyle = 'flex flex-row justify-between items-center w-full';
  const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => console.log(data);
  return (
    <div>
      <div className="p-8">
        <form className="flex flex-col w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <p className={labelStyle}>
            {`Airfield id: ${airfield.id}`}
          </p>
          <p className={labelStyle}>
            {`Airfield name: ${airfield.name}`}
          </p>
          <label className={labelStyle}>
            Max concurrent flights:
            <input
              className={textFieldStyle}
              {...register('maxFlights')}
            />
          </label>
          <Button type="submit" variant="primary"> Submit</Button>
        </form>
      </div>
    </div>
  );
}

export default AirfieldForm;
