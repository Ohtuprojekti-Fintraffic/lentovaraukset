import { AirfieldEntry } from '@lentovaraukset/shared/src';
import { Airfield } from '../models';

const getAirfield = async (id: number): Promise<AirfieldEntry> => {
  const airfield = await Airfield.findOne({
    where: {
      id,
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

const createTestAirfield = async () => {
  // TODO: Remove this when we have a proper admin interface for creating airfields
  await Airfield.upsert({
    id: 1,
    name: 'Test Airfield',
    maxConcurrentFlights: 3,
    eventGranularityMinutes: 20,
  });
};

export default {
  getAirfield,
  getAirfields,
  createTestAirfield,
};
