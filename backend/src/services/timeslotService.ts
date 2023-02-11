import { Op } from 'sequelize';
import type { TimeFrame } from '@lentovaraukset/shared/src/index';
import { Timeslot } from '../models';

const getInTimeRange = async (rangeStartTime: Date, rangeEndTime: Date): Promise<TimeFrame[]> => {
  const timeslots: Timeslot[] = await Timeslot.findAll({
    where: {
      [Op.or]: [{
        start: {
          [Op.between]: [rangeStartTime, rangeEndTime],
        },
      }, {
        end: {
          [Op.between]: [rangeStartTime, rangeEndTime],
        },
      }],
    },
  });

  return timeslots.map(({ id, start, end }) => ({ id, start, end }));
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
  timeslot: { start: Date, end: Date },
): Promise<void> => {
  await Timeslot.update(timeslot, { where: { id } });
};

const createTimeslot = async (newTimeSlot: { start: Date, end: Date }): Promise<TimeFrame> => {
  const { id, start, end }: TimeFrame = await Timeslot.create(newTimeSlot);
  return { id, start, end };
};

export default {
  getInTimeRange,
  deleteById,
  updateById,
  createTimeslot,
};
