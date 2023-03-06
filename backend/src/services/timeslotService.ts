import { Op } from 'sequelize';
import type { TimeslotEntry } from '@lentovaraukset/shared/src/index';
import reservationService from '@lentovaraukset/backend/src/services/reservationService';
import { Timeslot } from '../models';

const getInTimeRange = async (
  rangeStartTime: Date,
  rangeEndTime: Date,
): Promise<Timeslot[]> => {
  const timeslots: Timeslot[] = await Timeslot.findAll({
    where: {
      [Op.and]: [
        {
          start: {
            [Op.lt]: rangeEndTime,
          },
          end: {
            [Op.gt]: rangeStartTime,
          },
        },
      ],
    },
  });
  return timeslots;
};

const deleteById = async (id: number) => {
  const timeslot = await Timeslot.findByPk(id);
  if (!timeslot) {
    throw new Error('Timeslot does not exist');
  }
  const reservations = await timeslot?.getReservations();
  if (reservations?.length !== 0) {
    throw new Error('Timeslot has reservations');
  }
  await timeslot?.destroy();
};

const updateById = async (
  id: number,
  timeslot: { start: Date, end: Date },
): Promise<void> => {
  const newReservations = await reservationService
    .getReservationFromRange(timeslot.start, timeslot.end);
  const oldTimeslot: Timeslot | null = await Timeslot.findByPk(id);
  const oldReservations = await oldTimeslot?.getReservations();
  if (oldReservations?.length !== newReservations?.length) {
    throw new Error('Timeslot has reservations');
  }
  await oldTimeslot?.removeReservations(oldReservations);
  await oldTimeslot?.addReservations(newReservations);
  await Timeslot.upsert({ ...timeslot, id });
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
};
