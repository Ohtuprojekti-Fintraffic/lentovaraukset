import React from 'react';

type ModalProps = {
  show: boolean,
  handleClose: any,
  children: React.ReactNode
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
      <div
        className="fixed w-full h-full bg-black bg-opacity-40"
        onClick={() => handleClose()}
      />
      <div className="z-50 overflow-y-auto sm:overflow-visible">
        {children}
      </div>
    </div>
  );
}

export default Modal;
