import { AirfieldEntry } from '@lentovaraukset/shared/src';

const getAirfield = async (): Promise<AirfieldEntry> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/airfields/1`);
  return res.json();
};

export {
  // eslint-disable-next-line import/prefer-default-export
  getAirfield,
};
