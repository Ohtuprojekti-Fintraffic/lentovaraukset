import { Op } from 'sequelize';
import type { TimeslotEntry } from '@lentovaraukset/shared/src/index';
import reservationService from '@lentovaraukset/backend/src/services/reservationService';
import { Timeslot } from '../models';

const getInTimeRange = async (
  rangeStartTime: Date,
  rangeEndTime: Date,
  id: number | null = null,
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
        id
          ? {
            id: {
              [Op.ne]: id,
            },
          }
          : {},
      ],
    },
  });
  return timeslots;
};

const timeslotsAreConsecutive = async (
  timeslot: { start: Date, end: Date },
  id: number | null = null,
): Promise<boolean> => {
  const { start, end } = timeslot;
  const newStart = new Date(start);
  const newEnd = new Date(end);
  newStart.setMinutes(newStart.getMinutes() - 1);
  newEnd.setMinutes(newEnd.getMinutes() + 1);
  if (id) {
    const consecutiveTimeslots = await getInTimeRange(newStart, newEnd, id);
    return consecutiveTimeslots.length > 0;
  }
  const consecutiveTimeslots = await getInTimeRange(newStart, newEnd);
  return consecutiveTimeslots.length > 0;
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
  if (await timeslotsAreConsecutive(timeslot, id)) {
    throw new Error('Timeslot can\'t be consecutive');
  }
  const oldTimeslot: Timeslot | null = await Timeslot.findByPk(id);
  const oldReservations = await oldTimeslot?.getReservations();
  const newReservations = oldReservations?.filter(
    (reservation) => reservation.start >= timeslot.start && reservation.end <= timeslot.end,
  );

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
  if (await timeslotsAreConsecutive(newTimeSlot)) {
    throw new Error('Timeslot can\'t be consecutive');
  }
  const reservations = await reservationService
    .getInTimeRange(newTimeSlot.start, newTimeSlot.end);
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
