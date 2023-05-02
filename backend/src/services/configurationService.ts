import { ConfigurationEntry } from '@lentovaraukset/shared/src';
import { Configuration } from '../models';

/**
 * Retrieves a configuration entry by its ID.
 * @param id - The configuration entry ID.
 * @returns The ConfigurationEntry object.
 * @throws If the configuration entry is not found.
 */
const getById = async (id: number): Promise<ConfigurationEntry> => {
  const configuration = await Configuration.findByPk(id);
  if (!configuration) throw new Error('Configuration not found');
  return configuration.dataValues;
};

/**
 * Updates a configuration entry by its ID.
 * @param id - The configuration entry ID.
 * @param newConfiguration - The updated
 * configuration data without the ID.
 * @returns The updated ConfigurationEntry object.
 */
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
