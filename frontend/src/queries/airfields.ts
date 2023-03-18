import { AirfieldEntry } from '@lentovaraukset/shared/src';
import {
  useMutation, useQuery, useQueryClient,
} from 'react-query';
import QueryKeys from './queryKeys';
import { errorIfNotOk } from './util';

const getAirfields = async (airfieldId: number): Promise<AirfieldEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/airfields/${airfieldId}`);
  errorIfNotOk(res);
  return res.json();
};

const useAirfield = (airfieldId: number) => useQuery(
  [QueryKeys.Airfield, airfieldId],
  () => getAirfields(airfieldId),
);

const modifyAirfield = async (
  modifiedAirfield: AirfieldEntry,
): Promise<AirfieldEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/airfields/${modifiedAirfield.id}`, {
    method: 'PUT',
    body: JSON.stringify(modifiedAirfield),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
  return res.json();
};

const useAirfieldMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(modifyAirfield, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.Airfield);
    },
  });
};

export { useAirfield, useAirfieldMutation };
