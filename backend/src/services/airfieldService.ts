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

export default {
  getAirfield,
  getAirfields,
};
