import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
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
  cancelButtonText,
  handleClose,
}: ActionSheetProps) {
  const { t } = useTranslation();

  const filterChildrenByVariant = (variant: string) => React.Children.toArray(children)
    .filter((child) => React.isValidElement(child) && child.props.variant === variant);

  return (
    <div>
      <div className="hidden sm:flex flex-row justify-between">
        <div className="flex flex-row space-x-2 mr-8">
          {filterChildrenByVariant('danger')}
        </div>
        <div className="flex flex-row space-x-2">
          {
            cancelButton
            && (
              <Button
                variant="tertiary"
                onClick={() => handleClose!()}
              >
                {cancelButtonText || t('common.cancel')}
              </Button>
            )
          }
          {filterChildrenByVariant('tertiary')}
          {filterChildrenByVariant('secondary')}
          {filterChildrenByVariant('primary')}
        </div>
      </div>
      <div className="flex sm:hidden flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          {filterChildrenByVariant('primary')}
          {filterChildrenByVariant('secondary')}
          {filterChildrenByVariant('tertiary')}
          {
            cancelButton
            && (
              <Button
                variant="tertiary"
                onClick={() => handleClose!()}
              >
                {cancelButtonText || t('common.cancel')}
              </Button>
            )
          }
        </div>
        {
          filterChildrenByVariant('danger').length > 0 && (
            <div className="flex flex-col space-y-2">
              {filterChildrenByVariant('danger')}
            </div>
          )
        }
      </div>
    </div>
  );
}

export default ActionSheet;
export type { ActionSheetProps };
