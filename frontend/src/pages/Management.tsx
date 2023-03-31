/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import { airfieldValidator } from '@lentovaraukset/shared/src/validation/validation';
import AirfieldForm from '../components/forms/AirfieldForm';
import { useAirfield, modifyAirfieldMutation } from '../queries/airfields';

function Management() {
  const { isLoading, data: airfield } = useAirfield('EGLL'); // TODO: get id from airfield selection
  return (
    isLoading
      ? <p>Ladataan...</p>
      : (
        <div className="flex flex-col space-y-2">
          <AirfieldForm
            title="Lentokenttäkohtaiset asetukset"
            airfield={airfield}
            airfieldMutation={modifyAirfieldMutation}
            validator={airfieldValidator(false)}
          />
        </div>
      )
  );
}

export default Management;
