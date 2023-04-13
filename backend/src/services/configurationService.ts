import { ConfigurationEntry } from '@lentovaraukset/shared/src';
import { Configuration } from '../models';

const getById = async (id: number): Promise<ConfigurationEntry> => {
  const configuration = await Configuration.findByPk(id);
  if (!configuration) throw new Error('Configuration not found');
  return configuration.dataValues;
};

const updateById = async (
  id: number,
  newConfiguration: Omit<ConfigurationEntry, 'id' >,
): Promise<ConfigurationEntry> => {
  const [configuration]: [Configuration, boolean | null] = await Configuration
    .upsert({ ...newConfiguration, id });
  return configuration.dataValues;
};

export default {
  getById,
  updateById,
};
