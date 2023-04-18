import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Subheader from './Subheader';

type DropdownProps = {
  placeholder: string,
  defaultSection?: string,
  sections: string[],
  onChange: (section: string) => void ;
};

function Dropdown({
  placeholder, defaultSection, sections, onChange,
}: DropdownProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="flex flex-col relative max-w-md align-top">
      <div
        role="button"
        tabIndex={0}
        className="group flex flex-row justify-between gap-4 items-baseline border border-ft-neutral-200 p-4"
        onClick={() => setIsActive(!isActive)}
        onKeyDown={(e) => e.key === 'Enter' && setIsActive(!isActive)}
      >
        <Subheader className="font-ft-emphasis group-hover:text-ft-text-300">{defaultSection ?? placeholder}</Subheader>
        <div className="place-self-end group-hover:text-ft-text-300">{isActive ? <ChevronUp /> : <ChevronDown /> }</div>
      </div>

      <div className="absolute top-full w-full z-10 text-ft-primary-black bg-ft-primary-white divide-y divide-ft-neutral-200 shadow-lg max-h-72 overflow-y-auto">
        {isActive && Array.from(new Set(sections)).map((section) => ( // Sections must be unique
          <div
            key={section}
            role="button"
            tabIndex={0}
            className="group bg-ft-neutral-100 bg-opacity-20 p-4"
            onClick={() => {
              setIsActive(!isActive);
              onChange(section);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsActive(!isActive);
                onChange(section);
              }
            }}
          >
            <Subheader className="group-hover:text-ft-text-300">{section}</Subheader>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dropdown;
