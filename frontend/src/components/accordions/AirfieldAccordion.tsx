import React from 'react';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import Accordion from '../Accordion';

type AirfieldAccordionProps = {
  airfield?: AirfieldEntry,
  airfields: AirfieldEntry[],
  onChange: (a: AirfieldEntry) => void ;
};

function AirfieldAccordion({ airfield, airfields, onChange }: AirfieldAccordionProps) {
  const airfieldAsText = (a: AirfieldEntry) => `${a.name} (${a.code})`;

  const handleSelect = (selectedAirfield: AirfieldEntry) => {
    onChange(selectedAirfield);
  };

  return (
    <Accordion
      defaultSection={airfield ? airfieldAsText(airfield) : 'Valitse lentokenttä'}
      sections={airfields.map((a) => ({ title: airfieldAsText(a), content: a }))}
      onChange={handleSelect}
    />
  );
}

export default AirfieldAccordion;
