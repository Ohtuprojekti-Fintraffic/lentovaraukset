import React, { ReactElement } from 'react';
import { ActionSheetProps } from './ActionSheet';
import Modal from './Modal';

type CardProps = {
  show: boolean,
  form: React.ReactNode
  actionSheet: ReactElement<ActionSheetProps>
  handleClose: () => void,
};

function Card({
  show,
  form,
  actionSheet,
  handleClose,
}: CardProps) {
  return (
    <Modal show={show} handleClose={handleClose}>
      <div
        className=" flex flex-col max-w-fit h-fit bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        {form}
        {actionSheet}
      </div>
    </Modal>
  );
}

export default Card;
