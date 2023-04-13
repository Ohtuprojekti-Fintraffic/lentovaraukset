import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import Subheader from './Subheader';

type AccordionProps = {
  defaultSection: string,
  sections: string[],
  onChange: (section: string) => void ;
};

function Accordion({ defaultSection, sections, onChange }: AccordionProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="flex flex-col max-w-md align-top">
      <div
        role="button"
        tabIndex={0}
        className="group flex flex-row justify-between items-baseline border-b border-ft-neutral-200 p-4"
        onClick={() => setIsActive(!isActive)}
        onKeyDown={(e) => e.key === 'Enter' && setIsActive(!isActive)}
      >
        <Subheader className="font-ft-emphasis group-hover:text-ft-text-300">{defaultSection}</Subheader>
        <div className="place-self-end group-hover:text-ft-text-300">{isActive ? <Minus /> : <Plus />}</div>
      </div>

      {isActive && Array.from(new Set(sections)).map((section) => ( // Sections must be unique
        <div
          key={section}
          role="button"
          tabIndex={0}
          className="group border-b border-ft-neutral-200 bg-ft-neutral-100 bg-opacity-20 p-4"
          onClick={() => onChange(section)}
          onKeyDown={(e) => e.key === 'Enter' && onChange(section)}
        >
          <Subheader className="group-hover:text-ft-text-300">{section}</Subheader>
        </div>
      ))}
    </div>
  );
}

export default Accordion;
