import { Timeslot } from '../models';

const deleteById = async (id: number): Promise<boolean> => {
  const timeslot = await Timeslot.findByPk(id);
  if (timeslot) {
    timeslot.destroy();
    return true;
  }
  return false;
};

const updateById = async (id: number, timeslot: { starttime: Date, maxDuration: number }) => {
  await Timeslot.update(timeslot, { where: { id } });
}

export default {
  deleteById,
  updateById
};
