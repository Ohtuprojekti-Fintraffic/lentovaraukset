import React, { useId } from 'react';

type InputStates = 'default' | 'error' | 'disabled';
interface FieldProps {
  state?: InputStates;
  type: React.InputHTMLAttributes<HTMLInputElement>['type']
  value: React.InputHTMLAttributes<HTMLInputElement>['value']
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  labelText?: string;
  helperText?: string;
  inputClassName?: string;
}

function InputField({
  state = 'default', type, value, onChange, placeholder, labelText, helperText, inputClassName = '',
}: FieldProps) {
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
          className="font-ft-label mb-1"
        >
          {labelText}
        </label>
      ) : null}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={state === 'disabled'}
        placeholder={placeholder}
        className={`${fieldBaseClass} ${fieldStateClasses[state]} ${inputClassName}`}
      />
      {helperText ? <p className="text-ft-text-300 -mt-4">{helperText}</p> : null}
    </div>
  );
}

export default InputField;
