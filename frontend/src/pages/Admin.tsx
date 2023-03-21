import React from 'react';
import AdminForm from '../components/forms/AdminForm';

function Admin() {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl">Ylläpito</h1>
      <AdminForm />
    </div>
  );
}

export default Admin;
