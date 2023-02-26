import React from 'react';

type DisableableVariants = 'secondary' | 'tertiary' | 'danger' | 'glyph';
interface DisableableProps {
  variant: DisableableVariants;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

type UndisableableVariants = 'primary';
interface UndisableableProps extends Omit<DisableableProps, 'variant' | 'disabled'> {
  variant: UndisableableVariants;
  disabled?: undefined;
}
// This is mostly to make it clear that
// some button types can't be disabled
type ButtonProps = DisableableProps | UndisableableProps;

function Button({
  variant, children, onClick, disabled, className,
}: ButtonProps) {
  const buttonBaseClass = 'mx-1 py-3 px-4 rounded-ft-large font-ft-button text-ft-button';

  const buttonVariantClasses = {
    primary: 'bg-black text-white hover:bg-ft-interactive-200',

    // odd size because border adds to size and
    // border- box doesnt work because of dynamic size:
    secondary: disabled ? 'bg-transparent text-ft-text-300 border-2 px-[14px] py-[10px] border-ft-neutral-100'
      : ('bg-white text-black border-2 px-[14px] py-[10px] border-black'
      + ' hover:border-ft-interactive-200 hover:bg-ft-interactive-200 hover:border-ft-interactive-200 hover:text-white'),

    tertiary: disabled ? 'bg-transparent text-ft-text-300'
      : 'bg-transparent text-ft-text-1000 hover:text-white hover:bg-ft-interactive-200',

    danger: disabled ? 'bg-ft-neutral-100 text-ft-text-300'
      : 'bg-ft-danger-300 text-white hover:bg-ft-danger-400',

    glyph: disabled ? 'bg-ft-neutral-100 text-ft-text-300'
      : 'bg-transparent hover:bg-ft-interactive-200',
  };

  return (
    <button type="button" className={`${buttonBaseClass} ${buttonVariantClasses[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
