import React, { useEffect, useState } from 'react';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAirportContext } from '../contexts/AirportContext';
import { getAirfields } from '../queries/airfields';
import Dropdown from '../components/Dropdown';

type AirfieldDropdownProps = {
  airfield?: AirfieldEntry,
  airfields: AirfieldEntry[],
  onChange: (a: AirfieldEntry) => void ;
};

function AirfieldDropdown({ airfield, airfields, onChange }: AirfieldDropdownProps) {
  const handleSelect = (airfieldName: string) => {
    const selectedAirfield = airfields.find((a) => a.name === airfieldName)!;
    onChange(selectedAirfield);
  };

  return (
    <Dropdown
      placeholder="Lentoasema"
      defaultSection={airfield?.name}
      sections={airfields.map((a) => a.name)}
      onChange={handleSelect}
    />
  );
}

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
    <div className="w-full h-full flex flex-col items-center pt-16 gap-12">
      <div className="text-ft-h4">
        Fintraffic Koululentovaraukset
      </div>
      <div className="max-w-md">
        Sivun kuvaus lorem ipsum dolor sit amet...
      </div>
      <div className="w-full flex flex-row justify-center items-center gap-4 bg-black p-8 text-white">
        <div>Valitse lentoasema:</div>
        <AirfieldDropdown
          airfield={airport}
          airfields={airfields}
          onChange={onAirfieldChange}
        />
        <NavLink
          to="/varaukset"
          className={({ isActive }) => (isActive
            ? 'active font-bold'
            : '')}
        >
          <div className="flex flex-row items-center hover:text-ft-text-300 font-bold">
            <div>
              Varaa aika
            </div>
            <ChevronRight />
          </div>
        </NavLink>
      </div>
    </div>
  );
}

export default Landing;
