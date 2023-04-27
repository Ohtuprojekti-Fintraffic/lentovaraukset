import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Subheader from './Subheader';

type DropdownVariants = 'primary' | 'secondary' | 'tertiary';

type DropdownProps = {
  placeholder: string,
  selectedSection?: string,
  sections: string[],
  onChange: (section: string) => void ;
  error?: { message: string }
  variant?: DropdownVariants
  glyph?: React.ReactNode
  leftAligned?: boolean
};

function Dropdown({
  placeholder,
  selectedSection,
  sections,
  onChange,
  error,
  variant = 'primary',
  glyph,
  leftAligned = true,
}: DropdownProps) {
  const [isActive, setIsActive] = useState(false);

  const placeholderTextStyle = (placeholder && !selectedSection) ? 'text-ft-text-300 group-hover:text-ft-text-300' : 'group-hover:text-ft-text-300';
  const textStyle = error ? 'text-ft-danger-300' : placeholderTextStyle;

  const borderStyle = error ? 'border-2 border-ft-danger-300' : 'border border-ft-neutral-200';

  return (
    <div
      className="flex flex-col items-start gap-y-6"
    >
      <div
        className="flex flex-col relative max-w-md align-top"
        onBlur={() => setIsActive(false)}
      >
        {
          variant !== 'tertiary'
            ? (
              <div
                role="button"
                tabIndex={0}
                className={`group flex flex-row justify-between gap-2 items-end ${borderStyle} p-4`}
                onClick={() => setIsActive(!isActive)}
                onKeyDown={(e) => e.key === 'Enter' && setIsActive(!isActive)}
              >
                {glyph}
                <Subheader className={textStyle}>{selectedSection ?? placeholder}</Subheader>
                <div className=" group-hover:text-ft-text-300">{isActive ? <ChevronUp /> : <ChevronDown /> }</div>
              </div>
            )
            : (
              <div
                role="button"
                tabIndex={0}
                className="group flex flex-row justify-between items-center gap-2 flex-nowrap"
                onClick={() => setIsActive(!isActive)}
                onKeyDown={(e) => e.key === 'Enter' && setIsActive(!isActive)}
              >
                {glyph}
                <p className={`${textStyle} whitespace-nowrap`}>{selectedSection ?? placeholder}</p>
                <div className="group-hover:text-ft-text-300">{isActive ? <ChevronUp /> : <ChevronDown /> }</div>
              </div>
            )
      }

        <div className={`absolute top-full ${!leftAligned && 'right-0'} w-fit z-10 text-ft-primary-black bg-ft-primary-white divide-y divide-ft-neutral-200 shadow-lg max-h-72 overflow-y-auto`}>
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
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsActive(!isActive);
                  onChange(section);
                }
              }}
            >
              <Subheader className="group-hover:text-ft-text-300 whitespace-nowrap">{section}</Subheader>
            </div>
          ))}
        </div>
      </div>
      {error && (
        <p className="text-ft-danger-300 -mt-4 mb-1">{error.message}</p>
      )}
    </div>
  );
}

export default Dropdown;
