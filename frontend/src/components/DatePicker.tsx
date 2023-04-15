import { ErrorMessage } from '@hookform/error-message';
import React, {
  useId,
  useEffect,
  useState,
} from 'react';
import ReactDatePicker from 'react-datepicker';
import { Control, Controller, type FieldErrors } from 'react-hook-form';
import { fieldBaseClass, fieldStateClasses, InputStates } from './InputField';

type DatePickerProps = {
  control: Control<any>;
  name: React.InputHTMLAttributes<HTMLInputElement>['name'];
  placeholder?: string;
  labelText?: string;
  helperText?: string;
  timeGranularityMinutes: number;
  errors: FieldErrors;

  // CSS class extensions for the elems
  labelClassName?: string;
  inputClassName?: string;
  helperTextClassName?: string;
  showTimeSelect?: boolean;
};

function DatePicker({
  control,
  errors,
  name = '',
  placeholder,
  labelText,
  helperText,
  labelClassName = '',
  inputClassName = '',
  helperTextClassName = '',
  timeGranularityMinutes,
  showTimeSelect,
}: DatePickerProps) {
  const id = useId();

  const [state, setState] = useState<InputStates>('default');

  const errorsExist = errors !== undefined && errors?.[name] !== undefined;

  useEffect(() => {
    setState(errorsExist ? 'error' : 'default');
  }, [errorsExist]);

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
          <div className="flex flex-col items-start flex-wrap w-full">
            <ReactDatePicker
              className={`${fieldBaseClass} ${fieldStateClasses[state]} ${inputClassName}`}
              dateFormat={showTimeSelect ? 'dd.MM.yyyy HH:mm' : 'dd.MM.yyyy'}
              dropdownMode="select"
              minDate={new Date()}
              onBlur={onBlur}
              onChange={onChange}
              placeholderText={placeholder}
              selected={value ? new Date(value) : null}
              shouldCloseOnSelect
              showTimeSelect={showTimeSelect}
              timeIntervals={timeGranularityMinutes}
            />
          </div>
        )}
      />
      <ErrorMessage
        errors={errors}
        name={name}
        render={({ message }) => (
          <p className={`text-ft-danger-300 -mt-4 mb-1 ${helperTextClassName}`}>{message}</p>
        )}
      />
      {helperText && !errorsExist ? <p className={`text-ft-text-300 -mt-4 mb-1 ${helperTextClassName}`}>{helperText}</p> : null}
    </div>
  );
}

export default DatePicker;
