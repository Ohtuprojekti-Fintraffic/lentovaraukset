import { Op } from 'sequelize';
import type { TimeslotEntry } from '@lentovaraukset/shared/src/index';
import reservationService from '@lentovaraukset/backend/src/services/reservationService';
import { isTimeInPast } from '@lentovaraukset/shared/src/validation/validation';
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
  if (!timeslot) throw new Error('Timeslot does not exist');
  if (isTimeInPast(timeslot.start)) throw new Error('Timeslot in past cannot be deleted');
  const reservations = await timeslot?.getReservations();
  if (reservations?.length !== 0) {
    throw new Error('Timeslot has reservations');
  }
  await timeslot?.destroy();
};

const createPeriod = async (
  period: { periodStart: Date, periodEnd: Date, name: string },
  timeslot: { start: Date, end: Date },
): Promise<Timeslot[]> => {
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const { periodEnd } = period;
  const timeslotGroup: { start: Date, end: Date }[] = [];
  let { start, end } = timeslot;
  start = new Date(start.getTime() + oneWeek);
  end = new Date(end.getTime() + oneWeek);
  while (end <= periodEnd) {
    timeslotGroup.push({ start, end });
    start = new Date(start.getTime() + oneWeek);
    end = new Date(end.getTime() + oneWeek);
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const t of timeslotGroup) {
    // eslint-disable-next-line no-await-in-loop
    if (await timeslotsAreConsecutive(t)) {
      throw new Error('Timeslot can\'t be consecutive');
    }
    // eslint-disable-next-line no-await-in-loop
    const timeslots = await getInTimeRange(t.start, t.end);
    if (timeslots.length > 0) {
      throw new Error('Period has already timeslot');
    }
  }
  const addedTimeslot = await Timeslot
    .addGroupTimeslots(timeslotGroup.map((t) => ({ ...t, groupId: period.name })));
  return addedTimeslot;
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
  createPeriod,
};
