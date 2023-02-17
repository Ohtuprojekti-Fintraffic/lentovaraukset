import React from "react";
import { Children } from "react";
import Modal from "./Modal";

type Props = {
  show: boolean,
  handleClose: any,
  cancelButton?: boolean
  cancelButtonText?: string
  children?: React.ReactNode
};

const Card: React.FC<Props> = ({
  show, handleClose, children, cancelButton = true, cancelButtonText = "Peruuta"
}) => {

  return (
    <Modal show={show} handleClose={handleClose}>
      <div className=" flex flex-col w-1/2 max-w-md h-fit bg-white rounded-lg shadow-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
        {Children.toArray(children)[0]}
        {(Children.count(children) > 1 || cancelButton)
          && (
            <div className="flex flex-row justify-between p-4 bg-gray-100 border-t border-gray-200 w-full">
              {
                cancelButton
                && (
                  <div>
                    <button
                      className="bg-transparent text-black p-3 rounded-lg"
                      onClick={() => handleClose()}
                    >
                      {cancelButtonText}
                    </button>
                  </div>
                )
              }
              {
                Children.count(children) > 1
                && <div className='flex flex-row flex-end space-x-2'>
                  {
                    Children.map(children, (child, index) => index !== 0 && child)
                  }
                </div>
              }
            </div>
          )}
      </div>
    </Modal>
  )
}

export default Card