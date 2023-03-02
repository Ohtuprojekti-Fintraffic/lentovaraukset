import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AirfieldEntry } from '@lentovaraukset/shared/src';

type FormProps = {
  airfield: AirfieldEntry;
};

type FormValues = {
  maxFlights?: string;
};

function AirfieldForm(
  { airfield }: FormProps,
) {
  const {
    register, handleSubmit,
  } = useForm();
  const textFieldStyle = 'border border-black rounded p-1 ml-4';
  const labelStyle = 'flex flex-row justify-between items-center w-full';
  const maxFlightsReg = register('maxFlights');
  const onSubmit: SubmitHandler<FormValues> = (data: FormValues) => console.log(data);

  // const {airfield} = data;
  return (
    <div>
      <p>{`Airfield: ${airfield.name}`}</p>
      <div className="p-8">
        <form className="flex flex-col w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className={labelStyle} htmlFor="flight-input">
            Max concurrent flights:
            <input
              defaultValue={airfield.maxConcurrentFlights}
              className={textFieldStyle}
              onChange={maxFlightsReg.onChange}
              onBlur={maxFlightsReg.onBlur}
              name={maxFlightsReg.name}
              ref={maxFlightsReg.ref}
              id="flight-input"
            />
          </label>
          <input type="submit" />
        </form>
      </div>
    </div>
  );
}

export default AirfieldForm;
