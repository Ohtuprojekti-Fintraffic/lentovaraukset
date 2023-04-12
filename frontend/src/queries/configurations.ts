import { ConfigurationEntry } from '@lentovaraukset/shared/src';
import {
  useMutation, useQuery, useQueryClient,
} from 'react-query';
import QueryKeys from './queryKeys';
import { errorIfNotOk } from './util';

const getConfiguration = async (): Promise<ConfigurationEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/configurations/1`);
  errorIfNotOk(res);
  return res.json();
};

const useConfiguration = () => useQuery(
  [QueryKeys.Configuration],
  () => getConfiguration(),
);

const updateConfiguration = async (
  newConfiguration: Omit<ConfigurationEntry, 'id'>,
): Promise<ConfigurationEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/configurations/1`, {
    method: 'PUT',
    body: JSON.stringify(newConfiguration),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
  return res.json();
};

const updateConfigurationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(updateConfiguration, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.Configuration);
    },
  });
};

export { useConfiguration, updateConfigurationMutation };
