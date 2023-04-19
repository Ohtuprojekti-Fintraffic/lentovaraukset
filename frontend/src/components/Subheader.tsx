import React from 'react';

interface SubheaderProps {
  children: string;
  className?: string;
}
const subheaderBaseClass = 'font-sans text-left text-top leading-[137.5%]';

function Subheader({ children, className }: SubheaderProps) {
  return (
    <h2 className={`${subheaderBaseClass} ${className}`}>
      {children}
    </h2>
  );
}

export default Subheader;
