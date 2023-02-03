import { Op } from 'sequelize';
import { Timeslot } from '../models';

const deleteById = async (id: number): Promise<boolean> => {
  const timeslot = await Timeslot.findByPk(id);
  if (timeslot) {
    timeslot.destroy();
    return true;
  }
  return false;
};

// any until types are defined
// Max amount tbd (global?)
const createTimeslot = async (startTime: string): Promise<any> => {
  const timeslot = await Timeslot.create({ startTime: new Date(Number(startTime)), maxAmount: 1 });
  return timeslot;
};

// any until types are defined
const getTimeslotsByTimerange = async (startTime: string, endTime: string): Promise<any[]> => {
  const timeslots = await Timeslot.findAll({
    where: {
      startTime: { [Op.between]: [new Date(Number(startTime)), new Date(Number(endTime))] },
    },
  });
  return timeslots;
};

export default {
  deleteById,
  getTimeslotsByTimerange,
  createTimeslot,
};
