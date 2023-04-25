import React, { useEffect, useState } from 'react';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAirportContext } from '../contexts/AirportContext';
import { getAirfields } from '../queries/airfields';
import Dropdown from '../components/Dropdown';

type AirfieldDropdownProps = {
  airfield?: AirfieldEntry,
  airfields: AirfieldEntry[],
  onChange: (a: AirfieldEntry) => void ;
  error?: { message: string }
};

function AirfieldDropdown({
  airfield, airfields, onChange, error,
}: AirfieldDropdownProps) {
  const { t } = useTranslation();

  const handleSelect = (airfieldName: string) => {
    const selectedAirfield = airfields.find((a) => a.name === airfieldName)!;
    onChange(selectedAirfield);
  };

  return (
    <Dropdown
      placeholder={t('landing.airportDropdownPlaceholder')}
      selectedSection={airfield?.name}
      sections={airfields.map((a) => a.name)}
      onChange={handleSelect}
      error={error}
      variant="secondary"
    />
  );
}

function Landing() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { airport, setAirportICAO } = useAirportContext(); // TODO: get id from airfield selection
  const [airfields, setAirfields] = useState<AirfieldEntry[]>([]);

  const [airportSelectError, setAirportSelectError] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setAirfields(await getAirfields());
    };
    fetchData();
  }, []);

  const onAirfieldChange = (new_airport: AirfieldEntry) => {
    setAirportICAO(new_airport.code);
    setAirportSelectError(false);
  };

  return (
    <div className="w-full h-full flex flex-col items-center pt-16 gap-12">
      <div className="text-ft-h4">
        {t('landing.title')}
      </div>
      <div className="max-w-md">
        {t('landing.description')}
      </div>
      <div className="w-full flex flex-row justify-center items-center gap-4 bg-black p-8 text-white">
        <div>
          {t('landing.chooseAirport')}
        </div>
        <AirfieldDropdown
          airfield={airport}
          airfields={airfields}
          onChange={onAirfieldChange}
          error={airportSelectError
            ? { message: t('landing.emptyAirportError') }
            : undefined}
        />
        <button
          type="button"
          className="flex flex-row items-center hover:text-ft-text-300 font-bold"
          onClick={() => (airport ? navigate('/varaukset') : setAirportSelectError(true))}
        >
          <div>
            {t('landing.continue')}
          </div>
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

export default Landing;
