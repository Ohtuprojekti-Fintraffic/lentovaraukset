import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodTypeAny } from 'zod';
import { AirfieldEntry } from '@lentovaraukset/shared/src';
import { useTranslation } from 'react-i18next';
import Button from '../Button';
import InputField from '../InputField';

type FormProps = {
  showIdField?: boolean;
  title: string;
  airfield: AirfieldEntry | undefined;
  airfieldMutation: Function;
  validator: ZodTypeAny;
};

type Inputs = {
  code: string;
  maxConcurrentFlights: number;
  name: string;
  eventGranularityMinutes: number;
};

function AirfieldForm({
  showIdField = false,
  title,
  airfield,
  airfieldMutation,
  validator,
}: FormProps) {
  const { t } = useTranslation();

  const {
    register, handleSubmit, formState: { errors },
  } = useForm<Inputs>({
    defaultValues: airfield || {
      code: 'EF',
      eventGranularityMinutes: 20,
      maxConcurrentFlights: 1,
    },
    resolver: zodResolver(validator),
    mode: 'all',
  });

  const airfieldMutator = airfieldMutation();

  const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => {
    const code = data.code ? data.code : airfield?.code;
    airfieldMutator.mutate({ ...data, code });
  };

  return (
    <div>
      <div className="p-8 space-y-4">
        <h1 className="text-3xl">{title}</h1>
        <form className="flex flex-col w-full" onSubmit={handleSubmit(onSubmit)}>
          {showIdField && (
          <InputField
            labelText={t('management.airfield.form.icao')}
            type="string"
            registerReturn={register('code')}
            errors={errors}
          />
          )}
          <InputField
            labelText={t('management.airfield.form.name')}
            type="string"
            registerReturn={register('name')}
            errors={errors}
          />
          <InputField
            labelText={t('management.airfield.form.timeslotMinTime')}
            type="number"
            registerReturn={register('eventGranularityMinutes', {
              valueAsNumber: true,
            })}
            step={10}
            min={10}
            errors={errors}
          />
          <InputField
            labelText={t('management.airfield.form.maxConcurrentFlights')}
            type="number"
            registerReturn={register('maxConcurrentFlights', {
              valueAsNumber: true,
            })}
            step={1}
            min={1}
            errors={errors}
          />
          <Button type="submit" variant="primary">{t('common.save')}</Button>
        </form>
      </div>
    </div>
  );
}

export default AirfieldForm;
