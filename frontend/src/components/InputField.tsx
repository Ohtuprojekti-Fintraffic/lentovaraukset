import React, { useId } from 'react';
import ReactDatePicker from 'react-datepicker';
import { Controller, UseFormRegisterReturn, Control } from 'react-hook-form';

type InputStates = 'default' | 'error' | 'disabled';
export interface FieldProps {
  state?: InputStates;
  type: React.InputHTMLAttributes<HTMLInputElement>['type']

  value?: React.InputHTMLAttributes<HTMLInputElement>['value'];
  name?: React.InputHTMLAttributes<HTMLInputElement>['name'];
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;

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

export interface RHFFieldProps extends Omit<FieldProps, 'registerReturn' | 'value' | 'onChange' | 'onBlur'> {
  // RHF's register provides these
  value?: undefined;
  onChange?: undefined;
  name?: undefined;
  onBlur?: undefined;

  // React Hook Form register return value
  registerReturn: UseFormRegisterReturn<any>;
}

const fieldBaseClass = 'border-[1px] rounded-ft-normal px-4 py-[13px] text-ft-button font-ft-label '
                       + 'placeholder:text-ft-text-300 mb-4';

const fieldStateClasses = {
  default: 'border-ft-neutral-200',
  error: 'border-[3px] border-ft-danger-200 text-ft-danger-200',
  disabled: 'border-ft-neutral-200 text-ft-text-300 bg-ft-input-placeholder',
};

function InputField({
  state = 'default',
  type,
  value, name, onChange, onBlur,
  placeholder, labelText, helperText,
  registerReturn,
  labelClassName = '',
  inputClassName = '',
  helperTextClassName = '',
  defaultValue = '',
}: FieldProps | RHFFieldProps) {
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
        onChange={onChange}
        onBlur={onBlur}
        name={name}
        disabled={state === 'disabled'}
        placeholder={placeholder}
        className={`${fieldBaseClass} ${fieldStateClasses[state]} ${inputClassName}`}
        defaultValue={defaultValue}
        // This is the only way to use RHF without requiring input
        // types for the Hook Form inputs and whatever which
        // are complicated to do
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...registerReturn}
      />
      {helperText ? <p className={`text-ft-text-300 -mt-4 ${helperTextClassName}`}>{helperText}</p> : null}
    </div>
  );
}

type DatePickerProps = {
  control: Control<any>;
  state?: InputStates;
  name: React.InputHTMLAttributes<HTMLInputElement>['name'];
  placeholder?: string;
  labelText?: string;
  helperText?: string;
  timeGranularityMinutes: number;

  // CSS class extensions for the elems
  labelClassName?: string;
  inputClassName?: string;
  helperTextClassName?: string;
};

function DatePicker({
  control,
  state = 'default',
  name = '',
  placeholder,
  labelText,
  helperText,
  labelClassName = '',
  inputClassName = '',
  helperTextClassName = '',
  timeGranularityMinutes,
}: DatePickerProps) {
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
      <Controller
        control={control}
        name={name}
        render={({
          field: {
            onChange, onBlur, value,
          },
        }) => (
          <div className="flex flex-col items-start flex-wrap">
            <ReactDatePicker
              className={`${fieldBaseClass} ${fieldStateClasses[state]} ${inputClassName}`}
              dateFormat="dd.MM.yyyy HH:mm"
              dropdownMode="select"
              minDate={new Date()}
              onBlur={onBlur}
              onChange={onChange}
              placeholderText={placeholder}
              selected={value ? new Date(value) : null}
              shouldCloseOnSelect
              showTimeSelect
              timeIntervals={timeGranularityMinutes}
            />
          </div>
        )}
      />
      {helperText ? <p className={`text-ft-text-300 -mt-4 ${helperTextClassName}`}>{helperText}</p> : null}
    </div>
  );
}
export { InputField, DatePicker };
