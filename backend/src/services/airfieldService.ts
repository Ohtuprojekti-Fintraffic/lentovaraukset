import { AirfieldEntry, ServiceErrorCode } from '@lentovaraukset/shared/src';
import { Airfield } from '../models';
import ServiceError from '../util/errors';

const getAirfield = async (code: string): Promise<AirfieldEntry> => {
  const airfield = await Airfield.findByPk(code);

  if (!airfield) {
    throw new ServiceError(ServiceErrorCode.InvalidAirfield, 'Supplied airfield code could not be found');
  }

  return airfield.dataValues;
};

const getAirfields = async (): Promise<AirfieldEntry[]> => {
  const airfields = await Airfield.findAll();
  return airfields.map((airfield) => airfield.dataValues);
};

const updateByCode = async (
  code: string,
  airfield: Omit<AirfieldEntry, 'code'>,
): Promise<AirfieldEntry> => {
  const [updatedAirfield] = await Airfield.upsert(
    { ...airfield, code },
  );
  return updatedAirfield.dataValues;
};

const createAirfield = async (
  newAirfield: AirfieldEntry,
): Promise<AirfieldEntry> => {
  const airfield: Airfield = await Airfield.create(newAirfield);
  return airfield.dataValues;
};

const createTestAirfield = async () => {
  // TODO: Remove this when we have a proper admin interface for creating airfields
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
