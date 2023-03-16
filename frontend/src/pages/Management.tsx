/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import AirfieldForm from '../components/forms/AirfieldForm';
import { useAirfield } from '../queries/airfields';

function Management() {
  const { isLoading, data: airfield } = useAirfield(1); // TODO: get id from airfield selection
  return (
    isLoading
      ? <p>Ladataan...</p>
      : (
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl">Hallinta</h1>
          <AirfieldForm airfield={airfield!} />
        </div>
      )
  );
}

export default Management;
