import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Button from '../Button';
import InputField from '../InputField';

type Inputs = {
  maxDaysInFuture: number;
};

function AdminForm() {
  const {
    register, handleSubmit,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => {
    console.log(data);
  };

  return (
    <div>
      <div className="p-8">
        <form className="flex flex-col w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <InputField
            labelText="Kuinka monta päivää tulevaisuuteen varauksen voi tehdä:"
            type="number"
            registerReturn={register('maxDaysInFuture', {
              valueAsNumber: true,
            })}
            defaultValue="7"
          />
          <Button type="submit" variant="primary"> Submit</Button>
        </form>
      </div>
    </div>
  );
}

export default AdminForm;
