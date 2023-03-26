import { AirfieldEntry } from '@lentovaraukset/shared/src';
import { Airfield } from '../models';

const getAirfield = async (code: string): Promise<AirfieldEntry> => {
  const airfield = await Airfield.findByPk(code);

  if (!airfield) {
    throw new Error('Airfield not found');
  }

  return airfield.dataValues;
};

const getAirfields = async (): Promise<AirfieldEntry[]> => {
  const airfields = await Airfield.findAll();
  return airfields.map((airfield) => airfield.dataValues);
};

const updateByCode = async (
  code: string,
  airfield: AirfieldEntry,
): Promise<AirfieldEntry> => {
  const [updatedAirfield] = await Airfield.upsert(
    { ...airfield, code },
  );
  return updatedAirfield.dataValues;
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
  createTestAirfield,
};
