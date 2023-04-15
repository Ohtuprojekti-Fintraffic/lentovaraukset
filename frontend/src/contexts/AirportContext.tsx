import React, {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import { getAirfield } from '../queries/airfields';

type AirportContextType = {
  airport: AirfieldEntry | undefined,
  setAirportICAO: (icao: string) => void,
};

const AirportContext = createContext<AirportContextType>({} as AirportContextType);

function useAirport(icao: string | undefined) {
  const [airport, setAirport] = useState<AirfieldEntry | undefined>(undefined);

  useEffect(() => {
    const fetchAirport = async () => {
      const airfield = await getAirfield(icao!);
      setAirport(airfield);
    };

    if (icao) {
      fetchAirport();
    }
  }, []);

  return airport;
}

function useAirportContext() {
  const context = useContext(AirportContext);
  if (context === undefined) {
    throw new Error('useAirportContext must be used within a AirportContext');
  }
  return context;
}

type AirportProviderProps = {
  children?: React.ReactNode;
};

function AirportProvider({ children }: AirportProviderProps) {
  // TODO: set default airport as undefined and show a landing page to select one
  const [icao, setIcao] = useState<string | undefined>('EFHK');

  if (!icao) {
    const storedIcao = localStorage.getItem('icao');
    if (storedIcao) {
      setIcao(storedIcao);
    }
  }

  const airport = useAirport(icao);

  const setAirportICAO = (new_icao: string) => {
    setIcao(new_icao);
    localStorage.setItem('icao', new_icao);
  };

  const contextValues = useMemo(() => ({
    airport, setAirportICAO,
  }), [airport, setAirportICAO]);

  return (
    <AirportContext.Provider value={contextValues}>
      {children}
    </AirportContext.Provider>
  );
}

export { AirportProvider, useAirportContext };
