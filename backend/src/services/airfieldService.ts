import { Airfield } from '../models';

const getAirfield = async (id: number): Promise<Airfield> => {
  const airfield = await Airfield.findOne({
    where: {
      id,
    },
  });

  if (!airfield) {
    throw new Error('Airfield not found');
  }

  return airfield;
};

const getAirfields = async (): Promise<Airfield[]> => {
  const airfields = await Airfield.findAll();
  return airfields;
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
