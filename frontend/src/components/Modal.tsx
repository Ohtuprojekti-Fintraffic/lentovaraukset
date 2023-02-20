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
      className={`${showClass} fixed left-0 top-0 w-screen h-screen z-50 flex flex-col justify-center items-center`}
    >
      <div
        className="fixed w-full h-full bg-black bg-opacity-40"
        onClick={() => handleClose()}
      />
      <div className="z-[60]">
        {children}
      </div>
    </div>
  );
}

export default Modal;
