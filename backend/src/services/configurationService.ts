import { ConfigurationEntry } from '@lentovaraukset/shared/src';
import { Configuration } from '../models';

const getLatestConfiguration = async (): Promise<ConfigurationEntry> => {
  const configuration = await Configuration.findOne({
    order: [['createdAt', 'DESC']],
  });
  if (!configuration) throw new Error('Configuration not found');
  return configuration.dataValues;
};

const createConfiguration = async (
  newConfiguration: Omit<ConfigurationEntry, 'id' >,
): Promise<ConfigurationEntry> => {
  const configuration: Configuration = await Configuration.create(newConfiguration);
  return configuration.dataValues;
};

export default {
  createConfiguration,
  getLatestConfiguration,
};
