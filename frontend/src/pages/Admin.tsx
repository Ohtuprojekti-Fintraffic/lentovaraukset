import React from 'react';
import AdminForm from '../components/forms/AdminForm';
import AirfieldForm from '../components/forms/AirfieldForm';
import { createAirfieldMutation } from '../queries/airfields';

function Admin() {
  return (
    <div className="flex flex-col">
      <AdminForm title="Globaalit asetukset" />
      <AirfieldForm title="Lisää lentokenttä" airfield={undefined} airfieldMutation={createAirfieldMutation} showIdField />
    </div>
  );
}

export default Admin;
