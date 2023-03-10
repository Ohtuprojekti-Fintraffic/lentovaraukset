import React, { useId } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

type InputStates = 'default' | 'error' | 'disabled';

export interface FieldProps {
  state?: InputStates;
  type: React.InputHTMLAttributes<HTMLInputElement>['type'];

  value: React.InputHTMLAttributes<HTMLInputElement>['value'];
  onChange: React.ChangeEventHandler<HTMLInputElement>;

  // only applicable to field types:
  // 'datetime-local' | 'date' | 'month' | 'week' | 'time' | 'number' | 'range'
  step?: React.InputHTMLAttributes<HTMLInputElement>['step'];
  min?: React.InputHTMLAttributes<HTMLInputElement>['min'];
  max?: React.InputHTMLAttributes<HTMLInputElement>['max'];

  placeholder?: string;

  labelText?: string;
  helperText?: string;

  // CSS class extensions for the elems
  labelClassName?: string;
  inputClassName?: string;
  helperTextClassName?: string;

  // used in separate type below
  registerReturn: undefined;
  defaultValue?: string;
}

export interface RHFFieldProps extends Omit<FieldProps, 'registerReturn' | 'value' | 'onChange'> {
  // these are optional with RHF
  value?: React.InputHTMLAttributes<HTMLInputElement>['value']
  onChange?: React.ChangeEventHandler<HTMLInputElement>;

  // React Hook Form register return value
  registerReturn: UseFormRegisterReturn<any>;
}

function InputField({
  state = 'default',
  type, value, onChange,
  step, min, max,
  placeholder, labelText, helperText,
  registerReturn,
  labelClassName = '',
  inputClassName = '',
  helperTextClassName = '',
  defaultValue = '',
}: FieldProps | RHFFieldProps) {
  const fieldBaseClass = 'border-[1px] rounded-ft-normal px-4 py-[13px] text-ft-button font-ft-label '
                       + 'placeholder:text-ft-text-300 mb-4';

  const fieldStateClasses = {
    default: 'border-ft-neutral-200',
    error: 'border-[3px] border-ft-danger-200 text-ft-danger-200',
    disabled: 'border-ft-neutral-200 text-ft-text-300 bg-ft-input-placeholder',
  };

  const id = useId();

  return (
    <div className="flex flex-col items-start flex-wrap">
      { labelText ? (
        <label
          htmlFor={id}
          className={`font-ft-label mb-1 ${labelClassName}`}
        >
          {labelText}
        </label>
      ) : null}
      <input
        id={id}
        type={type}
        value={value}
        disabled={state === 'disabled'}
        placeholder={placeholder}
        className={`${fieldBaseClass} ${fieldStateClasses[state]} ${inputClassName}`}
        defaultValue={defaultValue}
        step={step}
        min={min}
        max={max}
        // This is the only way to use RHF without requiring input
        // types for the Hook Form inputs and whatever which
        // are complicated to do
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...registerReturn}
        onChange={onChange}
      />
      {helperText ? <p className={`text-ft-text-300 -mt-4 ${helperTextClassName}`}>{helperText}</p> : null}
    </div>
  );
}

export default InputField;
