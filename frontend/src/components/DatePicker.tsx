import React, {
  MutableRefObject, useEffect, useId, useRef,
} from 'react';
import ReactDatePicker from 'react-datepicker';
import { Control, Controller, FieldError } from 'react-hook-form';
import { fieldBaseClass, fieldStateClasses, InputStates } from './InputField';

type DatePickerProps = {
  control: Control<any>;
  state?: InputStates;
  name: React.InputHTMLAttributes<HTMLInputElement>['name'];
  placeholder?: string;
  labelText?: string;
  helperText?: string;
  timeGranularityMinutes: number;
  error?: Partial<FieldError>

  // CSS class extensions for the elems
  labelClassName?: string;
  inputClassName?: string;
  helperTextClassName?: string;
};

function DatePicker({
  control,
  error,
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

export default DatePicker;
