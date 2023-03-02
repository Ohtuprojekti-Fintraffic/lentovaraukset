/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import { useQuery } from 'react-query';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import { getAirfield } from '../queries/airfields';
import QueryKeys from '../queries/queryKeys';
import AirfieldForm from '../components/forms/AirfieldForm';

function Management() {
  const { data, error, isLoading } = useQuery(QueryKeys.Airfield, getAirfield);
  // if (error) return <div>Request Failed</div>;
  // if (isLoading) return <div>Loading...</div>;
  console.log({ data, error, isLoading });
  const airfield: AirfieldEntry = { id: 1, name: 'lentokentta', maxConcurrentFlights: 2 };
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl">Hallinta</h1>
      <AirfieldForm airfield={airfield} />
    </div>
  );
}

export default Management;
