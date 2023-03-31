import React, { ReactElement, useEffect, useRef } from 'react';
import { ActionSheetProps } from './ActionSheet';

type CardProps = {
  show: boolean,
  title: string,
  form: React.ReactNode
  actionSheet?: ReactElement<ActionSheetProps>
  handleClose: () => void,
};

function Card({
  show,
  title, form, actionSheet,
  handleClose,
}: CardProps) {
  const ref: React.LegacyRef<HTMLDialogElement> = useRef(null);

  useEffect(() => {
    if (show) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
      handleClose();
    }
  }, [show]);

  return (
    <dialog
      ref={ref}
      className="p-0 overflow-y-auto sm:overflow-visible w-[92%] max-w-xl h-fit bg-transparent rounded-ft-large backdrop:bg-opacity-40 backdrop:bg-black"
    >
      <div className="bg-white shadow-ft-elevation-300 rounded-ft-large overflow-hidden">
        <div className="bg-black p-3">
          <p className="text-white">
            {title}
          </p>
        </div>

        {form}

        {actionSheet && (
        <div className="bg-gray-100 border-t border-gray-200 p-4 w-full">
          { actionSheet }
        </div>
        )}
      </div>
    </dialog>
  );
}

export default Card;
