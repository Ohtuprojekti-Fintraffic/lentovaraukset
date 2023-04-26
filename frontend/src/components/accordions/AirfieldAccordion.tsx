import React from 'react';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import { useTranslation } from 'react-i18next';
import Accordion from '../Accordion';

type AirfieldAccordionProps = {
  airfield?: AirfieldEntry,
  airfields: AirfieldEntry[],
  onChange: (a: AirfieldEntry) => void ;
};

function AirfieldAccordion({ airfield, airfields, onChange }: AirfieldAccordionProps) {
  const { t } = useTranslation();

  const handleSelect = (airfieldName: string) => {
    const selectedAirfield = airfields.find((a) => a.name === airfieldName)!;
    onChange(selectedAirfield);
  };

  return (
    <Accordion
      defaultSection={airfield ? airfield.name : t('landing.chooseAirport')}
      sections={airfields.map((a) => a.name)}
      onChange={handleSelect}
    />
  );
}

export default AirfieldAccordion;
