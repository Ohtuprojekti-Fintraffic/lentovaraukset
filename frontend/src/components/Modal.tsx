import React from 'react';

type Props = {
  show: boolean,
  handleClose: any,
  children?: React.ReactNode
};

const Modal: React.FC<Props> = ({
  show, handleClose, children
}) => {
  const showClass = show ? 'flex' : 'hidden';

  return (
    <div
      className={`${showClass} flex flex-col fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-40 justify-center items-center z-50`}
      onClick={() => handleClose()}
    >
      {children}
    </div>
  );
};

export default Modal;
