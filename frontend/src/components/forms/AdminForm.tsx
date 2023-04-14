import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { configurationValidator } from '@lentovaraukset/shared/src/validation/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConfigurationEntry } from '@lentovaraukset/shared/src';
import Button from '../Button';
import InputField from '../InputField';
import { updateConfigurationMutation } from '../../queries/configurations';

type FormProps = {
  title: string;
  configuration: ConfigurationEntry | undefined;
};

type Inputs = {
  daysToStart: number;
  maxDaysInFuture: number;
};

function AdminForm({ title, configuration }: FormProps) {
  const {
    register, handleSubmit, formState: { errors },
  } = useForm<Inputs>({
    values: configuration,
    resolver: zodResolver(configurationValidator()),
    mode: 'all',
  });

  const configurationMutator = updateConfigurationMutation();

  const onSubmit: SubmitHandler<Inputs> = (data: Omit<Inputs, 'id'>) => {
    configurationMutator.mutate(data);
  };

  return (
    <div>
      <div className="p-8 space-y-4">
        <h1 className="text-3xl">{title}</h1>
        <form className="flex flex-col w-full" onSubmit={handleSubmit(onSubmit)}>
          <InputField
            labelText="Kuinka monta päivää vähintään pitää olla varauksen alkuun:"
            type="number"
            registerReturn={register('daysToStart', {
              valueAsNumber: true,
            })}
            min={0}
            step={1}
            errors={errors}
          />
          <InputField
            labelText="Kuinka monta päivää tulevaisuuteen varauksen voi tehdä:"
            type="number"
            registerReturn={register('maxDaysInFuture', {
              valueAsNumber: true,
            })}
            min={1}
            step={1}
            errors={errors}
          />
          <Button type="submit" variant="primary">Tallenna</Button>
        </form>
      </div>
    </div>
  );
}

export default AdminForm;
