import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SubheaderProps {
  children: string;
  className?: string;
}
const subheaderBaseClass = 'font-sans text-left text-top leading-[137.5%]';

function Subheader({ children, className }: SubheaderProps) {
  return (
    <h2 className={twMerge(subheaderBaseClass, className)}>
      {children}
    </h2>
  );
}

export default Subheader;
