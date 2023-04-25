/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState, useEffect } from 'react';
import { airfieldValidator } from '@lentovaraukset/shared/src/validation/validation';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import AirfieldForm from '../components/forms/AirfieldForm';
import { getAirfields, modifyAirfieldMutation } from '../queries/airfields';
import { useAirportContext } from '../contexts/AirportContext';
import AirfieldAccordion from '../components/accordions/AirfieldAccordion';

function Management() {
  const { airport, setAirportICAO } = useAirportContext();
  const [airfields, setAirfields] = useState<AirfieldEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setAirfields(await getAirfields());
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      <AirfieldAccordion
        airfield={airport}
        airfields={airfields}
        onChange={(a:AirfieldEntry) => setAirportICAO(a.code)}
      />
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
