import React, { useState } from 'react';

type AccordionProps = {
  section: string,
  sections: string[],
};

function Accordion({ section, sections }: AccordionProps) {
  const [isActive, setIsActive] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  return (
    <div className="flex flex-col max-w-md align-top text-ft-label text-ft-text-1000">
      <div role="button" tabIndex={0} className="border-b border-ft-neutral-200 p-4" onClick={() => setIsActive(!isActive)} onKeyDown={() => setIsActive(!isActive)}>
        <div className="flex flex-row justify-between items-baseline font-ft-emphasis ">
          <div className="">{selectedSection ?? section}</div>
          <div className="place-self-end">{isActive ? '-' : '+'}</div>
        </div>
      </div>
      {isActive && sections.map((item) => (
        <div key={item} role="button" tabIndex={0} className="border-b border-ft-neutral-200 bg-ft-neutral-100 bg-opacity-20 font-ft-label p-4" onClick={() => setSelectedSection(item)} onKeyDown={() => setSelectedSection(item)}>
          {item}
        </div>
      ))}
    </div>
  );
}

export default Accordion;
