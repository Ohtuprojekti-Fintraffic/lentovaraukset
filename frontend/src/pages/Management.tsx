/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import { AirfieldForm } from '../components/forms/AirfieldForm';

function Management() {
  const airfield: AirfieldEntry = { id: 1, name: 'lentokentta', maxConcurrentFlights: 2, eventGranularityMinutes: 20, futureReservationDays: 7 };
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl">Hallinta</h1>
      <AirfieldForm airfield={airfield} />
    </div>
  );
}

export default Management;
