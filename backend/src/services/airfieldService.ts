import { AirfieldEntry, ServiceErrorCode } from '@lentovaraukset/shared/src';
import { Airfield } from '../models';
import ServiceError from '../util/errors';

/**
 * Retrieves an airfield by its code.
 * @param {string} code - The airfield code.
 * @returns {Promise<AirfieldEntry>} The AirfieldEntry object.
 * @throws {ServiceError} If the airfield code is not found.
 */
const getAirfield = async (code: string): Promise<AirfieldEntry> => {
  const airfield = await Airfield.findByPk(code);

  if (!airfield) {
    throw new ServiceError(ServiceErrorCode.InvalidAirfield, 'Supplied airfield code could not be found');
  }

  return airfield.dataValues;
};

/**
 * Retrieves all airfields.
 * @returns {Promise<AirfieldEntry[]>} An array of AirfieldEntry objects.
 */
const getAirfields = async (): Promise<AirfieldEntry[]> => {
  const airfields = await Airfield.findAll();
  return airfields.map((airfield) => airfield.dataValues);
};

/**
 * Updates an airfield by its code.
 * @param {string} code - The airfield code.
 * @param {Omit<AirfieldEntry, 'code'>} airfield - The updated airfield data without the code.
 * @returns {Promise<AirfieldEntry>} The updated AirfieldEntry object.
 */
const updateByCode = async (
  code: string,
  airfield: Omit<AirfieldEntry, 'code'>,
): Promise<AirfieldEntry> => {
  const [updatedAirfield] = await Airfield.upsert(
    { ...airfield, code },
  );
  return updatedAirfield.dataValues;
};

/**
 * Creates a new airfield.
 * @param {AirfieldEntry} newAirfield - The new airfield data.
 * @returns {Promise<AirfieldEntry>} The created AirfieldEntry object.
 */
const createAirfield = async (
  newAirfield: AirfieldEntry,
): Promise<AirfieldEntry> => {
  const airfield: Airfield = await Airfield.create(newAirfield);
  return airfield.dataValues;
};

/**
 * Creates a test airfield.
 * @todo Remove this when we have a proper admin interface for creating airfields
 */
const createTestAirfield = async () => {
  await Airfield.upsert({
    code: 'EFHK',
    name: 'Helsinki-Vantaan lentoasema',
    maxConcurrentFlights: 3,
    eventGranularityMinutes: 20,
  });
};

export default {
  getAirfield,
  getAirfields,
  updateByCode,
  createAirfield,
  createTestAirfield,
};
