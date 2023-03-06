import { AirfieldEntry } from '@lentovaraukset/shared/src';
import { useQuery } from 'react-query';
import QueryKeys from './queryKeys';

const getAirfields = async (airfieldId: number): Promise<AirfieldEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/airfields/${airfieldId}`);
  return res.json();
};

const useAirfield = (airfieldId: number) => useQuery(
  [QueryKeys.Airfield, airfieldId],
  () => getAirfields(airfieldId),
);

export default useAirfield;
