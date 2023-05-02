import React from 'react';
import { airfieldValidator } from '@lentovaraukset/shared/src/validation/validation';
import { useTranslation } from 'react-i18next';
import AdminForm from '../components/forms/AdminForm';
import AirfieldForm from '../components/forms/AirfieldForm';
import { createAirfieldMutation } from '../queries/airfields';
import { useConfiguration } from '../queries/configurations';

function Admin() {
  const { t } = useTranslation();

  const { data: configuration } = useConfiguration();

  return (
    <div className="flex flex-col">
      <AdminForm title={t('admin.globalSettings.title')} configuration={configuration} />
      <AirfieldForm
        title={t('admin.newAirfield.title')}
        airfield={undefined}
        airfieldMutation={createAirfieldMutation}
        validator={airfieldValidator(true, t)}
        showIdField
      />
    </div>
  );
}

export default Admin;
