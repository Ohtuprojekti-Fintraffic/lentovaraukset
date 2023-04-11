import React from 'react';
import { airfieldValidator } from '@lentovaraukset/shared/src/validation/validation';
import AdminForm from '../components/forms/AdminForm';
import AirfieldForm from '../components/forms/AirfieldForm';
import { createAirfieldMutation } from '../queries/airfields';
import { useConfiguration } from '../queries/configurations';

function Admin() {
  const { data: configuration } = useConfiguration();
  return (
    <div className="flex flex-col">
      <AdminForm title="Globaalit asetukset" configuration={configuration} />
      <AirfieldForm
        title="Lisää lentokenttä"
        airfield={undefined}
        airfieldMutation={createAirfieldMutation}
        validator={airfieldValidator(true)}
        showIdField
      />
    </div>
  );
}

export default Admin;
