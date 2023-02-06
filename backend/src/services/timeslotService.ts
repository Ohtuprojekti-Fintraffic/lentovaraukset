import { Op } from 'sequelize';
import { Timeslot } from '../models';

const getInTimeRange = async (rangeStartTime: Date, rangeEndTime: Date) => {
  const timeslots = await Timeslot.findAll({
    where: {
      [Op.or]: [{
        startTime: {
          [Op.between]: [rangeStartTime, rangeEndTime],
        },
      }, {
        endTime: {
          [Op.between]: [rangeStartTime, rangeEndTime],
        },
      }],
    },
  });
  return timeslots.map((timeslot) => ({
    start: timeslot.dataValues.startTime,
    end: timeslot.dataValues.endTime,
  }));
};

const deleteById = async (id: number): Promise<boolean> => {
  const timeslot = await Timeslot.findByPk(id);
  if (timeslot) {
    timeslot.destroy();
    return true;
  }
  return false;
};

const updateById = async (
  id: number,
  timeslot: { startTime: Date, endTime: Date, maxConcurrentFlights: number },
) => {
  await Timeslot.update(timeslot, { where: { id } });
};

const createTimeslot = async (startTime: Date, endTime: Date) => {
  const timeslot: any = await Timeslot.create(({ startTime, endTime, maxConcurrentFlights: 1 }));
  return timeslot;
};

export default {
  getInTimeRange,
  deleteById,
  updateById,
  createTimeslot,
};
