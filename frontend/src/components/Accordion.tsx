import React, { useState } from 'react';

type AccordionProps = {
  section: string,
  sections: string[],
};

function Accordion({ section, sections }: AccordionProps) {
  const [isActive, setIsActive] = useState(false);
  return (
    <div className="flex flex-col max-w-md align-top">
      <div role="button" tabIndex={0} className="border-b border-ft-neutral-200" onClick={() => setIsActive(!isActive)} onKeyDown={() => setIsActive(!isActive)}>
        <div className="flex flex-row justify-between items-baseline mx-4 my-4 font-ft-emphasis text-ft-label text-ft-text-1000">
          <div className="">{section}</div>
          <div className="place-self-end">{isActive ? '-' : '+'}</div>
        </div>
      </div>
      {isActive && (
        <div className="bg-ft-neutral-100 bg-opacity-20 font-ft-label text-ft-label text-ft-text-1000">
          {sections.map((item) => (
            <div key={item} className="border-b border-ft-neutral-200">
              <div className="mx-4 my-4">
                {item}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Accordion;
