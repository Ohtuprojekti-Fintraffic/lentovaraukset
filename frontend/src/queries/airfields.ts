import { AirfieldEntry } from '@lentovaraukset/shared/src';
import {
  useMutation, useQuery, useQueryClient,
} from 'react-query';
import QueryKeys from './queryKeys';
import { errorIfNotOk } from './util';

const getAirfields = async (): Promise<AirfieldEntry[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/airfields`);
  errorIfNotOk(res);
  return res.json();
};

const getAirfield = async (airfieldCode: string): Promise<AirfieldEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/airfields/${airfieldCode}`);
  errorIfNotOk(res);
  return res.json();
};

const useAirfield = (airfieldCode: string) => useQuery(
  [QueryKeys.Airfield, airfieldCode],
  () => getAirfield(airfieldCode),
);

const modifyAirfield = async (
  modifiedAirfield: AirfieldEntry,
): Promise<AirfieldEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/airfields/${modifiedAirfield.code}`, {
    method: 'PUT',
    body: JSON.stringify(modifiedAirfield),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
  return res.json();
};

const createAirfield = async (
  newAirfield: AirfieldEntry,
): Promise<AirfieldEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/airfields/`, {
    method: 'POST',
    body: JSON.stringify(newAirfield),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
  return res.json();
};

const modifyAirfieldMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(modifyAirfield, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.Airfield);
    },
  });
};

const createAirfieldMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(createAirfield, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.Airfield);
    },
  });
};

export {
  getAirfields,
  getAirfield,
  useAirfield,
  modifyAirfieldMutation,
  createAirfieldMutation,
};
