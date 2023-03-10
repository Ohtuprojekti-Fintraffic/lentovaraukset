import React, { Children } from 'react';
import Button from './Button';
import Modal from './Modal';

type CardProps = {
  show: boolean,
  handleClose: any,
  cancelButton?: boolean
  cancelButtonText?: string
  children: React.ReactNode
};

function Card({
  show,
  handleClose,
  children,
  cancelButton = true,
  cancelButtonText = 'Peruuta',
}: CardProps) {
  return (
    <Modal show={show} handleClose={handleClose}>
      <div
        className=" flex flex-col max-w-fit h-fit bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        {Children.toArray(children)[0]}
        {(Children.count(children) > 1 || cancelButton)
          && (
            <div className="flex flex-row justify-between p-4 bg-gray-100 border-t border-gray-200 w-full">
              {
                cancelButton
                && (
                  <div>
                    <Button
                      variant="tertiary"
                      onClick={() => handleClose()}
                    >
                      {cancelButtonText}
                    </Button>
                  </div>
                )
              }
              {
                Children.count(children) > 1
                && (
                <div className="flex flex-row flex-end space-x-2">
                  {
                    Children.map(children, (child, index) => index !== 0 && child)
                  }
                </div>
                )
              }
            </div>
          )}
      </div>
    </Modal>
  );
}

export default Card;
