/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import { airfieldValidator } from '@lentovaraukset/shared/src/validation/validation';
import AirfieldForm from '../components/forms/AirfieldForm';
import { modifyAirfieldMutation } from '../queries/airfields';
import { useAirportContext } from '../contexts/AirportContext';

function Management() {
  const { airport } = useAirportContext(); // TODO: get id from airfield selection
  return (
    <div className="flex flex-col space-y-2">
      <AirfieldForm
        title="Lentokenttäkohtaiset asetukset"
        airfield={airport}
        airfieldMutation={modifyAirfieldMutation}
        validator={airfieldValidator(false)}
      />
    </div>
  );
}

export default Management;
