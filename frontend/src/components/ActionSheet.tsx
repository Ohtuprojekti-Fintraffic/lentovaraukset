import React, { ReactElement } from 'react';
import Button, { ButtonProps } from './Button';

interface ActionSheetPropsWithoutCancel {
  children: ReactElement<ButtonProps> | (ReactElement<ButtonProps> | undefined)[];
  cancelButton: false;
  cancelButtonText?: never;
  handleClose?: never;
}

interface ActionSheetPropsWithCancel {
  children: ReactElement<ButtonProps> | (ReactElement<ButtonProps> | undefined)[];
  cancelButton?: true;
  cancelButtonText?: string;
  handleClose: () => void;
}

// handleClose and cancelButtonText are not needed when cancel button is not shown
type ActionSheetProps = ActionSheetPropsWithCancel | ActionSheetPropsWithoutCancel;

function ActionSheet({
  children,
  cancelButton = true,
  cancelButtonText = 'Peruuta',
  handleClose,
}: ActionSheetProps) {
  const filterChildrenByVariant = (variant: string) => React.Children.toArray(children)
    .filter((child) => React.isValidElement(child) && child.props.variant === variant);

  return (
    <div>

      <div className="flex flex-row  justify-between p-4 bg-gray-100 border-t border-gray-200 w-full">
        <div className="flex flex-row flex-end space-x-2">
          {filterChildrenByVariant('danger')}
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
          {filterChildrenByVariant('tertiary')}
          {filterChildrenByVariant('secondary')}
          {filterChildrenByVariant('primary')}
        </div>
      </div>
    </div>
  );
}

export default ActionSheet;
export type { ActionSheetProps };
