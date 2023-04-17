import React, { useEffect, useState } from 'react';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import AirfieldAccordion from '../components/accordions/AirfieldAccordion';
import { useAirportContext } from '../contexts/AirportContext';
import { getAirfields } from '../queries/airfields';

function Landing() {
  const { airport, setAirportICAO } = useAirportContext(); // TODO: get id from airfield selection
  const [airfields, setAirfields] = useState<AirfieldEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setAirfields(await getAirfields());
    };
    fetchData();
  }, []);

  const onAirfieldChange = (new_airport: AirfieldEntry) => {
    setAirportICAO(new_airport.code);
    console.log(`Selected airfield: ${airport?.name}`);
  };

  return (
    <div className="w-full h-full flex flex-row justify-between">
      <div className="h-full flex flex-col justify-center gap-4">
        <div>Valitse lentoasema:</div>
        <AirfieldAccordion
          airfield={airport}
          airfields={airfields}
          onChange={onAirfieldChange}
        />
      </div>
    </div>
  );
}

export default Landing;
