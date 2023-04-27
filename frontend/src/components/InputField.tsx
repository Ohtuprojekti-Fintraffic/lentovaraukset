import React, {
  type MutableRefObject, useId, useRef,
} from 'react';
import type {
  UseFormRegisterReturn, FieldErrors,
} from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { twMerge } from 'tailwind-merge';

export type InputStates = 'default' | 'error' | 'disabled';

export interface FieldProps {
  state?: InputStates;
  type: React.InputHTMLAttributes<HTMLInputElement>['type'];

  value: React.InputHTMLAttributes<HTMLInputElement>['value'];
  name: React.InputHTMLAttributes<HTMLInputElement>['name'];
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;

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
  registerReturn?: undefined;
  errors?: undefined;
  defaultValue?: string;
}

export interface RHFFieldProps extends Omit<FieldProps, 'registerReturn' | 'value' | 'onChange' | 'onBlur' | 'name' | 'errors'> {
  // RHF's register provides these
  value?: undefined;
  onChange?: undefined;
  name?: undefined;
  onBlur?: undefined;

  // React Hook Form register return value and errors
  registerReturn: UseFormRegisterReturn<any>;
  errors: FieldErrors<any>;
}

export const fieldBaseClass = 'w-full border-[1px] rounded-ft-normal px-[16px] py-[13px] text-ft-button font-ft-label '
  + 'placeholder:text-ft-text-300 mb-4';

export const checkboxBaseClass = 'mb-4';

export const fieldInvalidClass = 'invalid:bg-ft-warning-100 invalid:text-ft-warning-300'
  + 'invalid:border-ft-warning-300';

export const fieldStateClasses = {
  default: 'border-ft-neutral-200',
  error: 'border-[3px] py-[11px] px-[14px] border-ft-danger-200 text-ft-danger-200',
  disabled: 'border-ft-neutral-200 text-ft-text-300 bg-ft-input-placeholder',
  invalid: fieldInvalidClass,
};

function InputField({
  state = 'default',
  type,
  value, name, onChange, onBlur,
  step, min, max,
  placeholder, labelText, helperText,
  errors,
  registerReturn,
  labelClassName = '',
  inputClassName = '',
  helperTextClassName = '',
  defaultValue = '',
}: FieldProps | RHFFieldProps) {
  const id = useId();

  const inputRef: MutableRefObject<HTMLInputElement | null> = useRef(null);

  const errorsExist = errors !== undefined && errors?.[registerReturn.name] !== undefined;

  const fieldState = errorsExist ? 'error' : state;

  return (
    <div className={type === 'checkbox'
      ? 'flex flex-row justify-start items-baseline gap-x-2'
      : 'flex flex-col items-start flex-wrap gap-y-1 w-full'}
    >
      {labelText ? (
        <label
          htmlFor={id}
          className={`font-ft-label ${labelClassName}`}
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
        className={type === 'checkbox'
          ? twMerge(`${checkboxBaseClass} ${fieldStateClasses[fieldState]} ${fieldInvalidClass}`, inputClassName)
          : twMerge(`${fieldBaseClass} ${fieldStateClasses[fieldState]} ${fieldInvalidClass}`, inputClassName)}
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
      {registerReturn && (
      // ErrorMessage is only used for react hook form fields
      <ErrorMessage
        errors={errors}
        name={registerReturn?.name}
        render={({ message }) => (
          <p className={`text-ft-danger-300 -mt-4 mb-1 ${helperTextClassName}`}>{message}</p>
        )}
      />
      )}
      {helperText && !errorsExist ? <p className={`text-ft-text-300 -mt-4 mb-1 ${helperTextClassName}`}>{helperText}</p> : null}
    </div>
  );
}

export default InputField;
