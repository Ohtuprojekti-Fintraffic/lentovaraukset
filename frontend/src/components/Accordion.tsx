import React, { useState } from 'react';
import Subheader from './Subheader';

type AccordionProps = {
  defaultSection: string,
  sections: string[],
  onChange: (section: string) => void ;
};

function Accordion({ defaultSection, sections, onChange }: AccordionProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="flex flex-col h-full w-full max-w-md align-top">
      <div
        role="button"
        tabIndex={0}
        className="flex flex-row justify-between items-baseline border-b border-ft-neutral-200 p-4"
        onClick={() => setIsActive(!isActive)}
        onKeyDown={(e) => e.key === 'Enter' && setIsActive(!isActive)}
      >
        <Subheader className="font-ft-emphasis">{defaultSection}</Subheader>
        <div className="place-self-end">{isActive ? '-' : '+'}</div>
      </div>

      {isActive && Array.from(new Set(sections)).map((section) => ( // Sections must be unique
        <div
          key={section}
          role="button"
          tabIndex={0}
          className="border-b border-ft-neutral-200 bg-ft-neutral-100 bg-opacity-20 p-4"
          onClick={() => onChange(section)}
          onKeyDown={(e) => e.key === 'Enter' && onChange(section)}
        >
          <Subheader>{section}</Subheader>
        </div>
      ))}
    </div>
  );
}

export default Accordion;
