import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import Button from '../Button';
import InputField from '../InputField';

type FormProps = {
  airfield: AirfieldEntry;
};

type Inputs = {
  maxFlights: string;
  maxDays: string;
};

function AirfieldForm(
  { airfield }: FormProps,
) {
  const {
    register, handleSubmit,
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => console.log(data);
  return (
    <div>
      <div className="p-8">
        <form className="flex flex-col w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <ul>
            <li>
              {`Id: ${airfield.id}`}
            </li>
            <li>
              {`Nimi: ${airfield.name}`}
            </li>
            <li>
              {`Varausikkunan minimikoko: ${airfield.eventGranularityMinutes}`}
            </li>
          </ul>
          <InputField
            labelText="Kuinka monta päivää tulevaisuuteen varauksen voi tehdä:"
            type="number"
            registerReturn={register('maxDays')}
            defaultValue={airfield.futureReservationDays.toString()}
          />
          <InputField
            labelText="Samanaikaisten varausten maksimimäärä:"
            type="number"
            registerReturn={register('maxFlights')}
            defaultValue={airfield.maxConcurrentFlights.toString()}
          />
          <Button type="submit" variant="primary"> Submit</Button>
        </form>
      </div>
    </div>
  );
}

export default AirfieldForm;
