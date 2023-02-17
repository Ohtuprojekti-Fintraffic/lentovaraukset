import { Op } from 'sequelize';
import type { TimeslotEntry } from '@lentovaraukset/shared/src/index';
import { Reservation, Timeslot } from '../models';

const getReservationsInTimeslotRange = async (start: Date, end: Date) => {
  const reservations = await Reservation.findAll({
    where: {
      [Op.and]: [
        {
          start: {
            [Op.gte]: start,
          },
        },
        {
          end: {
            [Op.lte]: end,
          },
        },
      ],
    },
  });
  return reservations;
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
  const newReservations = await getReservationsInTimeslotRange(timeslot.start, timeslot.end);
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
  const reservations = await getReservationsInTimeslotRange(newTimeSlot.start, newTimeSlot.end);
  const timeslot: Timeslot = await Timeslot.create(newTimeSlot);
  await timeslot.addReservations(reservations);
  return timeslot;
};

export default {
  getInTimeRange,
  deleteById,
  updateById,
  createTimeslot,
};
