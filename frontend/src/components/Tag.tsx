import React from 'react';

interface TagProps {
  children: React.ReactNode;
  styleName: 'badge'
  bgColorClassName: string;
  textColorClassName?: undefined;
}

interface IdProps extends Omit<TagProps, 'styleName' | 'textColorClassName'> {
  styleName: 'id';
  textColorClassName: string;
}

function Tag({
  children, styleName, bgColorClassName, textColorClassName,
}: TagProps | IdProps) {
  const baseClassName = 'px-[8px] py-[3.5px] rounded-ft-normal max-w-fit';
  const idTagClassName = `font-mono font-ft-emphasis text-ft-id ${bgColorClassName} ${textColorClassName}`;
  const badgeTagClassName = 'font-sans font-ft-emphasis text-ft-tag text-white';

  const className = styleName === 'id' ? idTagClassName : badgeTagClassName;
  return <p className={`${baseClassName} ${className}`}>{children}</p>;
}

export default Tag;
