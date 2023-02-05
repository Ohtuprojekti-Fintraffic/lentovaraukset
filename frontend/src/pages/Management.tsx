/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import { useQuery } from 'react-query';
import { getResrvationStatus } from '../queries/query';
import QueryKeys from '../queries/queryKeys';

function Management() {
  const { data, isLoading, isError } = useQuery(QueryKeys.ReservationStatus, getResrvationStatus, {
    refetchOnWindowFocus: false,
  });
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl">Hallinta</h1>
      {isError && <p className="text-base">Virhe: varaustilannetta ei pystytty hakemaan</p>}
      {isLoading
        ? <p className="text-base">Haetaan dataa palvelimelta</p>
        : (
          <div className="text-base">
            <div>
              <h1>Vapaat Ajat</h1>
              {data.availableSlots.length === 0
                ? <p> Ei vapaita aikoja saatavilla</p>
                : (
                  <ul>
                    {data.availableSlots.map(
                      (slot: any) => <li key={slot.id}>{slot.startTime}</li>,
                    )}
                  </ul>
                )}
            </div>
            <div>
              <h1>Varatut Ajat</h1>
              {data.reservedSlots.length === 0
                ? <p> Ei Varattuja aikoja</p>
                : (
                  <ul>
                    {data.reservedSlots.map(
                      (slot: any) => <li key={slot.id}>{slot.startTime}</li>,
                    )}
                  </ul>
                )}
            </div>
          </div>
        )}
    </div>
  );
}

export default Management;
