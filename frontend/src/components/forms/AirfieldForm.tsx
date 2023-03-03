import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import Button from '../Button';
imprt InputField from '../InputField';

type FormProps = {
  airfield: AirfieldEntry;
};

type Inputs = {
  maxFlights: string;
};

export function AirfieldForm(
  { airfield }: FormProps,
) {
  const {
    register, handleSubmit,
  } = useForm<Inputs>({
    defaultValues: {
      maxFlights: airfield.maxConcurrentFlights.toString(),
    }
  });
  const textFieldStyle = 'border border-black rounded p-1 ml-4';
  const labelStyle = 'flex flex-row justify-between items-center w-full';
  const {ref, ...rest} = register("maxFlights")
  const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => console.log(data);
  return (
    <div>
      <div className="p-8">
        <form className="flex flex-col w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <p className={labelStyle}>
            {`Id: ${airfield.id}`}
          </p>
          <p className={labelStyle}>
            {`Name: ${airfield.name}`}
          </p>
          <p className={labelStyle}>
            {`Event granularity in minutes: ${airfield.eventGranularityMinutes}`}
          </p>
          <p className={labelStyle}>
            {`How many days in future reservation can be done: ${airfield.futureReservationDays}`}
          </p>
          <InputField
            labelText=" Max concurrent flights:"
            type="number"
            reference={ref}
            {...rest}
          />
          <Button type="submit" variant="primary"> Submit</Button>
        </form>
      </div>
    </div>
  );
}
