import React from 'react';
import AdminForm from '../components/forms/AdminForm';
import AirfieldForm from '../components/forms/AirfieldForm';
import { createAirfieldMutation } from '../queries/airfields';

function Admin() {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl">Globaalit asetukset</h1>
      <AdminForm />
      <h1 className="text-3xl">Lisää lentokenttä</h1>
      <AirfieldForm airfield={undefined} airfieldMutation={createAirfieldMutation} />
    </div>
  );
}

export default Admin;
