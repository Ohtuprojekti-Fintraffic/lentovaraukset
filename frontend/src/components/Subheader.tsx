import React from 'react';

interface SubheaderProps {
  children: string;
  className?: string;
}
const subheaderBaseClass = 'font-publicSans font-medium text-base text-black align-left align-top leading-[137.5%]';

function Subheader({ children, className }: SubheaderProps) {
  return (
    <h2 className={`${subheaderBaseClass} ${className}`}>
      {children}
    </h2>
  );
}

export default Subheader;
