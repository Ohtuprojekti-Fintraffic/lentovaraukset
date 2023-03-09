import React from 'react';
import { X as Cross } from 'lucide-react';
import Button from './Button';
// Dependency cycle is just because of a type import
// and shouldn't be a problem
// eslint-disable-next-line import/no-cycle
import { usePopupContext } from '../contexts/PopupContext';

export interface PopupProps {
  popupTitle: string;

  popupText?: string;

  // Glyph button
  crossOnClick?: React.MouseEventHandler<HTMLButtonElement>;

  // Button props
  // could be defined in pairs but this will do
  dangerText?: string;
  dangerOnClick?: React.MouseEventHandler<HTMLButtonElement>;
  tertiaryText?: string;
  tertiaryOnClick?: React.MouseEventHandler<HTMLButtonElement>;
  secondaryText?: string;
  secondaryOnClick?: React.MouseEventHandler<HTMLButtonElement>;
  primaryText?: string;
  primaryOnClick?: React.MouseEventHandler<HTMLButtonElement>;
}

function Popup() {
  // we either get a false for show here
  // or true and the component's props
  const { popupState } = usePopupContext();

  if (!popupState.isPopupShown) {
    return null;
  }

  // the PopupProps
  const {
    popupTitle, popupText,
    crossOnClick,
    dangerText, dangerOnClick,
    tertiaryText, tertiaryOnClick,
    secondaryText, secondaryOnClick,
    primaryText, primaryOnClick,
  }: PopupProps = popupState.popupProps;

  const popupClassName = 'fixed justify-center items-center flex overflow-x-hidden overflow-y-auto inset-0 z-50';

  const popupContentClassName = 'relative w-auto shadow-ft-elevation-400 bg-white p-8 rounded-ft-large';

  return (
    <div
      className={popupClassName}
      role="dialog"
    >
      <div className={popupContentClassName}>
        <div className="flex flex-row items-center justify-between">
          <h4 className="text-ft-hs4 text-black font-ft-heading mr-4">{ popupTitle }</h4>
          {crossOnClick && <Button variant="glyph" onClick={crossOnClick}><Cross strokeWidth="1.5" /></Button>}
        </div>
        {popupText && <p className="text-ft-popup-message text-black font-ft-body justify-items-end mt-4">Modal message</p>}
        <div className="flex flex-row items-center pt-8">
          {dangerText && <Button variant="danger" className="justify-self-start mr-[88px] ml-0" onClick={dangerOnClick}>{dangerText}</Button>}
          {tertiaryText && <Button variant="tertiary" onClick={tertiaryOnClick}>{tertiaryText}</Button>}
          {secondaryText && <Button variant="secondary" onClick={secondaryOnClick}>{secondaryText}</Button>}
          {primaryText && <Button variant="primary" onClick={primaryOnClick}>{primaryText}</Button>}
        </div>
      </div>

    </div>
  );
}

export default Popup;
