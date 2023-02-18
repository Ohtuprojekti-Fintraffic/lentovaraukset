import { Op } from 'sequelize';
import type { TimeslotEntry } from '@lentovaraukset/shared/src/index';
import reservationService from '@lentovaraukset/backend/src/services/reservationService';
import { Timeslot } from '../models';

const getTimeslotFromRange = async (startTime: Date, endTime: Date) => {
  const timeslots: Timeslot[] = await Timeslot.findAll({
    where: {
      start: {
        [Op.lt]: endTime,
      },
      end: {
        [Op.gt]: startTime,
      },
    },
  });
  return timeslots;
};

const getInTimeRange = async (
  rangeStartTime: Date,
  rangeEndTime: Date,
): Promise<TimeslotEntry[]> => {
  const timeslots: Timeslot[] = await Timeslot.findAll({
    where: {
      [Op.or]: [
        {
          start: {
            [Op.between]: [rangeStartTime, rangeEndTime],
          },
        },
        {
          end: {
            [Op.between]: [rangeStartTime, rangeEndTime],
          },
        },
      ],
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
  const newReservations = await reservationService
    .getReservationFromRange(timeslot.start, timeslot.end);
  const oldTimeslot: Timeslot | null = await Timeslot.findByPk(id);
  const oldReservations = await oldTimeslot?.getReservations();
  await oldTimeslot?.removeReservations(oldReservations);
  await oldTimeslot?.addReservations(newReservations);
  await Timeslot.update(timeslot, { where: { id } });
};

const createTimeslot = async (newTimeSlot: {
  start: Date;
  end: Date;
}): Promise<TimeslotEntry> => {
  const reservations = await reservationService
    .getReservationFromRange(newTimeSlot.start, newTimeSlot.end);
  const timeslot: Timeslot = await Timeslot.create(newTimeSlot);
  await timeslot.addReservations(reservations);
  return timeslot.dataValues;
};

export default {
  getInTimeRange,
  deleteById,
  updateById,
  createTimeslot,
  getTimeslotFromRange,
};
