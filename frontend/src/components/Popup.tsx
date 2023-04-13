import React, { useEffect, useRef } from 'react';
import { X as Cross } from 'lucide-react';
import Button from './Button';
// Dependency cycle is just because of a type import
// and shouldn't be a problem
// eslint-disable-next-line import/no-cycle
import { usePopupContext } from '../contexts/PopupContext';
import ActionSheet from './ActionSheet';

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

  const ref: React.LegacyRef<HTMLDialogElement> = useRef(null);

  useEffect(() => {
    // popups might not always be cancelable so disable the esc dialog cancel
    ref.current?.addEventListener('cancel', (event) => {
      event.preventDefault();
    });
  });

  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, [popupState.isPopupShown]);

  // cleans up destructuring later, otherwise not necessary
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

  const popupClassName = 'p-0 fixed justify-center items-center flex overflow-x-hidden overflow-y-auto rounded-ft-large shadow-ft-elevation-400 '
                       + 'backdrop:bg-transparent';

  const popupContentClassName = 'flex flex-col space-y-6 w-auto bg-white p-8 max-w-prose';

  return (
    <dialog
      className={popupClassName}
      role="alertdialog"
      ref={ref}
    >
      <div className={popupContentClassName}>
        <div className="flex flex-row items-center justify-between">
          <h4 className="text-ft-hs4 text-black font-ft-heading mr-4">{ popupTitle }</h4>
          {crossOnClick && <Button variant="glyph" onClick={crossOnClick}><Cross strokeWidth="1.5" /></Button>}
        </div>
        {popupText && <p className="text-ft-popup-message text-black font-ft-body">{ popupText }</p>}
        <ActionSheet cancelButton={false}>
          {dangerText ? <Button variant="danger" onClick={dangerOnClick}>{dangerText}</Button> : undefined}
          {tertiaryText ? <Button variant="tertiary" onClick={tertiaryOnClick}>{tertiaryText}</Button> : undefined}
          {secondaryText ? <Button variant="secondary" onClick={secondaryOnClick}>{secondaryText}</Button> : undefined}
          {primaryText ? <Button variant="primary" onClick={primaryOnClick}>{primaryText}</Button> : undefined}
        </ActionSheet>
      </div>

    </dialog>
  );
}

export default Popup;
