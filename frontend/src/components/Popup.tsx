import React from 'react';
import { X as Cross } from 'lucide-react';
import Button from './Button';

interface PopupProps {
  closePopup: () => void

}

function Popup({ closePopup }: PopupProps) {
  const popupClassName = 'fixed justify-center items-center flex overflow-x-hidden overflow-y-auto inset-0 z-50';

  const popupContentClassName = 'relative w-auto shadow-ft-elevation-400 bg-white p-8 rounded-ft-large';

  return (
    <div
      id="fuckyou"
      className={popupClassName}
      role="dialog"
    >
      <div className={popupContentClassName}>
        <div className="flex flex-row items-center justify-between">
          <p className="text-ft-hs4 text-black font-ft-heading mr-4">Modal title</p>
          <Button variant="glyph" onClick={closePopup}><Cross strokeWidth="1.5" /></Button>
        </div>
        <p className="text-ft-popup-message text-black font-ft-body justify-items-end mt-4">Modal message</p>
        <div className="flex flex-row items-center pt-8">
          <Button variant="danger" className="justify-self-start mr-[88px]">Button</Button>
          <Button variant="tertiary">Button</Button>
          <Button variant="secondary">Button</Button>
          <Button variant="primary">Button</Button>
        </div>
      </div>

    </div>
  );
}

export default Popup;
