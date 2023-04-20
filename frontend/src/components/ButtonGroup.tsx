import React, { ReactElement } from 'react';
import { ButtonProps } from './Button';

interface ButtonGroupProps {
  children: ReactElement<ButtonProps>[];
}

function isElementArray(array: unknown[]): array is React.ReactElement[] {
  return array.every((it) => React.isValidElement(it));
}

// https://fullcalendar.io/docs/Calendar-prev
// https://fullcalendar.io/docs/Calendar-changeView

function ButtonGroup({
  children,
}: ButtonGroupProps) {
  const buttons = React.Children.toArray(children);
  if (buttons.length < 2 || !isElementArray(buttons)) {
    // why would you use this thing without multiple buttons?
    return null;
  }

  const first = React.cloneElement(buttons[0], {
    className: `${buttons[0].props.className} rounded-r-none border-r-0`,
  });
  const middle = React.Children.map(
    buttons.slice(1, buttons.length - 1),
    (button) => React.cloneElement(button, {
      className: `${buttons[buttons.length - 1].props.className} rounded-none border-l-[1px] border-r-0`,
    }),
  );
  const last = React.cloneElement(buttons[buttons.length - 1], {
    className: `${buttons[buttons.length - 1].props.className} rounded-l-none border-l-[1px]`,
  });

  return (
    <div className="">
      {first}
      {middle}
      {last}
    </div>
  );
}

export default ButtonGroup;
