import React, {
  MutableRefObject, useEffect, useId, useRef,
} from 'react';
import {
  UseFormRegisterReturn, FieldError,
} from 'react-hook-form';

export type InputStates = 'default' | 'error' | 'disabled';

export interface FieldProps {
  state?: InputStates;
  type: React.InputHTMLAttributes<HTMLInputElement>['type'];

  value?: React.InputHTMLAttributes<HTMLInputElement>['value'];
  name?: React.InputHTMLAttributes<HTMLInputElement>['name'];
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;

  // only applicable to field types:
  // 'datetime-local' | 'date' | 'month' | 'week' | 'time' | 'number' | 'range'
  step?: React.InputHTMLAttributes<HTMLInputElement>['step'];
  min?: React.InputHTMLAttributes<HTMLInputElement>['min'];
  max?: React.InputHTMLAttributes<HTMLInputElement>['max'];

  placeholder?: string;

  labelText?: string;
  helperText?: string;

  error?: Partial<FieldError>

  // CSS class extensions for the elems
  labelClassName?: string;
  inputClassName?: string;
  helperTextClassName?: string;

  // used in separate type below
  registerReturn: undefined;
  defaultValue?: string;
}

export interface RHFFieldProps extends Omit<FieldProps, 'registerReturn' | 'value' | 'onChange' | 'onBlur'> {
  // RHF's register provides these
  value?: undefined;
  onChange?: undefined;
  name?: undefined;
  onBlur?: undefined;

  // React Hook Form register return value
  registerReturn: UseFormRegisterReturn<any>;
}

export const fieldBaseClass = 'border-[1px] rounded-ft-normal px-4 py-[13px] text-ft-button font-ft-label '
                       + 'placeholder:text-ft-text-300 mb-4';

export const fieldInvalidClass = 'invalid:bg-ft-warning-100 invalid:text-ft-warning-300'
                            + 'invalid:border-ft-warning-300';

export const fieldStateClasses = {
  default: 'border-ft-neutral-200',
  error: 'border-[3px] border-ft-danger-200 text-ft-danger-200',
  disabled: 'border-ft-neutral-200 text-ft-text-300 bg-ft-input-placeholder',
  invalid: fieldInvalidClass,
};

function InputField({
  state = 'default',
  type,
  value, name, onChange, onBlur,
  step, min, max,
  placeholder, labelText, helperText,
  error,
  registerReturn,
  labelClassName = '',
  inputClassName = '',
  helperTextClassName = '',
  defaultValue = '',
}: FieldProps | RHFFieldProps) {
  const id = useId();

  const inputRef: MutableRefObject<HTMLInputElement | null> = useRef(null);

  useEffect(() => {
    inputRef.current?.setCustomValidity(error?.message || '');
    inputRef.current?.reportValidity();
  }, [error]);

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
        onChange={onChange}
        onBlur={onBlur}
        name={name}
        disabled={state === 'disabled'}
        placeholder={placeholder}
        className={`${fieldBaseClass} ${fieldStateClasses[state]} ${fieldInvalidClass} ${inputClassName}`}
        defaultValue={defaultValue}
        step={step}
        min={min}
        max={max}
        // This is the only way to use RHF without requiring input
        // types for the Hook Form inputs and whatever which
        // are complicated to do
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...registerReturn}
        ref={(e) => {
          registerReturn?.ref(e);
          inputRef.current = e;
        }}
      />
      {helperText ? <p className={`text-ft-text-300 -mt-4 ${helperTextClassName}`}>{helperText}</p> : null}
    </div>
  );
}

export default InputField;
