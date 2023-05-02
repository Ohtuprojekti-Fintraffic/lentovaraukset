import React, { ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';
import { ButtonProps } from './Button';

// https:// design.fintraffic.fi/594a251b1/p/07cc4f-button-group
interface ButtonGroupProps {
  children: ReactElement<ButtonProps>[];
  noBorder?: boolean; // should be used for glyph rows
  activeIdx?: number; // < children.length
  className?: string;
}

function isElementArray(array: unknown[]): array is React.ReactElement[] {
  return array.every((it) => React.isValidElement(it));
}

// https://fullcalendar.io/docs/Calendar-prev
// https://fullcalendar.io/docs/Calendar-changeView

function ButtonGroup({
  children, noBorder = false, activeIdx, className,
}: ButtonGroupProps) {
  const buttons = React.Children.toArray(children);
  if (buttons.length < 2 || !isElementArray(buttons)) {
    // why would you use this thing without multiple buttons?
    return null;
  }

  const first = React.cloneElement(buttons[0], {
    className: twMerge(buttons[0].props.className, 'rounded-r-none border-r-0'),
    active: activeIdx === 0,
  });
  const middle = React.Children.map(
    buttons.slice(1, buttons.length - 1),
    (button, idx) => React.cloneElement(button, {
      className: twMerge(button.props.className, `rounded-none border-r-0 ${noBorder ? '' : 'border-l-[1px]'}`),
      active: activeIdx === 1 + idx,
    }),
  );
  const last = React.cloneElement(buttons[buttons.length - 1], {
    className: twMerge(buttons[buttons.length - 1].props.className, `rounded-l-none ${noBorder ? '' : 'border-l-[1px]'}`),
    active: activeIdx === buttons.length - 1,
  });

  return (
    <div className={className}>
      {first}
      {middle}
      {last}
    </div>
  );
}

export default ButtonGroup;
