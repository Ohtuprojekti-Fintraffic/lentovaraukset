import { ConfigurationEntry } from '@lentovaraukset/shared/src';
import {
  useMutation, useQuery, useQueryClient,
} from 'react-query';
import QueryKeys from './queryKeys';
import { errorIfNotOk } from './util';

const getLatestConfiguration = async (): Promise<ConfigurationEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/configurations/latest`);
  errorIfNotOk(res);
  return res.json();
};

const useConfiguration = () => useQuery(
  [QueryKeys.Configuration],
  () => getLatestConfiguration(),
);

const createConfiguration = async (
  newConfiguration: Omit<ConfigurationEntry, 'id'>,
): Promise<ConfigurationEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/configurations/`, {
    method: 'POST',
    body: JSON.stringify(newConfiguration),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
  return res.json();
};

const createConfigurationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(createConfiguration, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.Configuration);
    },
  });
};

export { useConfiguration, createConfigurationMutation };