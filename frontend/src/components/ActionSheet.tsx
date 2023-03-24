import React, { ReactElement } from 'react';
import Button, { ButtonProps } from './Button';

interface ActionSheetProps {
  children: ReactElement<ButtonProps> | ReactElement<ButtonProps>[];
  cancelButton?: boolean
  cancelButtonText?: string
  handleClose?: () => void,
}

function ActionSheet({
  children,
  cancelButton = true,
  cancelButtonText = 'Peruuta',
  handleClose,
}: ActionSheetProps) {
  return (
    <div>
      {children}

      <div className="flex flex-row justify-between p-4 bg-gray-100 border-t border-gray-200 w-full">
        <div className="flex flex-row flex-end space-x-2">
          {
          }
        </div>
        <div className="flex flex-row flex-end space-x-2">
          {
            cancelButton
            && (
              <div>
                <Button
                  variant="tertiary"
                  onClick={() => handleClose!()}
                >
                  {cancelButtonText}
                </Button>
              </div>
            )
          }
          {

          }
        </div>
      </div>
    </div>
  );
}

export default ActionSheet;
export type { ActionSheetProps };
