import { ErrorMessage } from '@hookform/error-message';
import React, {
  useId,
  useEffect,
  useState,
} from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import fi from 'date-fns/locale/fi';
import en from 'date-fns/locale/en-GB';
import sv from 'date-fns/locale/sv';
import { Control, Controller, type FieldErrors } from 'react-hook-form';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { fieldBaseClass, fieldStateClasses, InputStates } from './InputField';

registerLocale('fi', fi);
registerLocale('en', en);
registerLocale('sv', sv);

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
  const { t, i18n } = useTranslation();

  const id = useId();

  const [state, setState] = useState<InputStates>('default');

  const errorsExist = errors !== undefined && errors?.[name] !== undefined;

  useEffect(() => {
    setState(errorsExist ? 'error' : 'default');
  }, [errorsExist]);

  return (
    <div className="flex flex-col items-start flex-wrap w-full">
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
        }) => {
          const offsetMinutes = (new Date()).getTimezoneOffset();
          return (
            <div className="flex flex-col items-start flex-wrap w-full">
              <ReactDatePicker
                className={`${fieldBaseClass} ${fieldStateClasses[state]} ${inputClassName} ${value}`}
                dateFormat={showTimeSelect ? 'dd.MM.yyyy HH:mm' : 'dd.MM.yyyy'}
                dropdownMode="select"
                minDate={DateTime.now().toJSDate()} // local tz
                onBlur={onBlur}
                // while React-DatePicker works with Date objects,
                // This DatePicker component interfaces with ISO strings
                // so there has to be a conversion inbetween
                onChange={(date, event) => {
                  if (!date) { onChange(null, event); return; }
                  // this should now be the time that the user chose in UTC
                  const time = DateTime.fromJSDate(date).toUTC().minus({ minutes: offsetMinutes });
                  onChange(time.toISO(), event);
                }}
              // onChange={onChange}
                timeCaption={t('common.time')}
                locale={i18n.language.includes('en') ? 'en' : 'fi'}
                placeholderText={placeholder}
                // We apply the time zone difference so that the user chooses an UTC time
                // even if ReactDatePicker only does local tz
                selected={value
                  ? DateTime.fromISO(value).plus({ minutes: offsetMinutes }).toJSDate()
                  : null}
                shouldCloseOnSelect
                showTimeSelect={showTimeSelect}
                timeIntervals={timeGranularityMinutes}
              />
            </div>

          );
        }}
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
