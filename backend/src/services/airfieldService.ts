import { AirfieldEntry, AirfieldEntryWithId } from '@lentovaraukset/shared/src';
import { Airfield } from '../models';

const getAirfield = async (code: string): Promise<AirfieldEntry> => {
  const airfield = await Airfield.findOne({
    where: {
      code,
    },
  });

  if (!airfield) {
    throw new Error('Airfield not found');
  }

  return airfield.dataValues;
};

const getAirfields = async (): Promise<AirfieldEntry[]> => {
  const airfields = await Airfield.findAll();
  return airfields.map((airfield) => airfield.dataValues);
};

const updateById = async (
  code: string,
  airfield: AirfieldEntry,
): Promise<AirfieldEntry> => {
  const [updatedAirfield] = await Airfield.upsert(
    { ...airfield, code },
  );
  return updatedAirfield.dataValues;
};

const createAirfield = async (
  newAirfield: AirfieldEntryWithId,
): Promise<AirfieldEntry> => {
  const airfield: Airfield = await Airfield.create(newAirfield);
  return airfield.dataValues;
};

const createTestAirfield = async () => {
  // TODO: Remove this when we have a proper admin interface for creating airfields
  await Airfield.upsert({
    code: 'EGLL',
    name: 'Test Airfield',
    maxConcurrentFlights: 3,
    eventGranularityMinutes: 20,
  });
};

export default {
  getAirfield,
  getAirfields,
  updateById,
  createAirfield,
  createTestAirfield,
};
