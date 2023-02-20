import React from 'react';

type ModalProps = {
  show: boolean,
  handleClose: any,
  children?: React.ReactNode
};

function Modal({
  show,
  handleClose,
  children,
}: ModalProps) {
  const showClass = show ? 'flex' : 'hidden';

  return (
    <div
      className={`${showClass} fixed left-0 top-0 w-screen h-screen z-40 flex flex-col justify-center items-center`}
      role="dialog"
      aria-modal="true"
    >

      { /* eslint-disable
        jsx-a11y/click-events-have-key-events,
        jsx-a11y/no-static-element-interactions */
      }
      <div
        className="fixed w-full h-full bg-black bg-opacity-40"
        onClick={() => handleClose()}
      />
      { /* eslint-enable
        jsx-a11y/click-events-have-key-events,
        jsx-a11y/no-static-element-interactions */
      }
      <div className="z-50">
        {children}
      </div>
    </div>
  );
}

export default Modal;
