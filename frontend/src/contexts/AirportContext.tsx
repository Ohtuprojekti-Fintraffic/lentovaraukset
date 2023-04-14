import React, {
  createContext, useContext, useEffect, useState,
} from 'react';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import { getAirfield } from '../queries/airfields';

const AirportContext = createContext<AirfieldEntry | undefined>(undefined);

export const useAirportContext = () => {
  const context = useContext(AirportContext);
  if (context === undefined) {
    throw new Error('useAirportContext must be used within a AirportContext');
  }
  return context;
};

const useAirport = () => {
  const [airport, setAirport] = useState<AirfieldEntry | undefined>(undefined);

  useEffect(() => {
    const icao = window.location.pathname.split('/')[1];

    const fetchAirport = async () => {
      const airfield = await getAirfield(icao);
      setAirport(airfield);
    };

    if (icao) {
      fetchAirport();
    }
  }, []);

  return airport;
};

type AirportProviderProps = {
  children?: React.ReactNode;
};

export function AirportProvider({ children }: AirportProviderProps) {
  const airport = useAirport();

  return (
    <AirportContext.Provider value={airport}>
      {children}
    </AirportContext.Provider>
  );
}
