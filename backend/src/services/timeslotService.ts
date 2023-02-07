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
    id: timeslot.dataValues.id,
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
  timeslot: { startTime: Date, endTime: Date },
) => {
  await Timeslot.update(timeslot, { where: { id } });
};

const createTimeslot = async (newTimeSlot: { startTime: Date, endTime: Date }) => {
  const timeslot: any = await Timeslot.create((newTimeSlot));
  return timeslot;
};

export default {
  getInTimeRange,
  deleteById,
  updateById,
  createTimeslot,
};
