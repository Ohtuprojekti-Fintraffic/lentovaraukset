import { Op } from 'sequelize';
import type { TimeslotEntry, TimeslotType } from '@lentovaraukset/shared/src/index';
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
  timeslot: { start: Date, end: Date, type: TimeslotType },
  id: number | null = null,
): Promise<boolean> => {
  const { start, end, type } = timeslot;
  const newStart = new Date(start);
  const newEnd = new Date(end);
  newStart.setMinutes(newStart.getMinutes() - 1);
  newEnd.setMinutes(newEnd.getMinutes() + 1);
  if (id) {
    const consecutiveTimeslots = await getInTimeRange(newStart, newEnd, id);
    return consecutiveTimeslots.filter((t) => t.type === type).length > 0;
  }
  const consecutiveTimeslots = await getInTimeRange(newStart, newEnd);
  return consecutiveTimeslots.filter((t) => t.type === type).length > 0;
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
  id: number,
  period: { periodEnd: Date, name: string },
  timeslot: { start: Date, end: Date, type: TimeslotType },
): Promise<Timeslot[]> => {
  const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000;
  const { periodEnd } = period;
  const timeslotGroup: { start: Date, end: Date, type: TimeslotType }[] = [];
  const { start, end, type } = timeslot;
  start.setTime(start.getTime() + oneWeekInMillis);
  end.setTime(end.getTime() + oneWeekInMillis);
  while (end <= periodEnd) {
    timeslotGroup.push({ start: new Date(start.getTime()), end: new Date(end.getTime()), type });
    start.setTime(start.getTime() + oneWeekInMillis);
    end.setTime(end.getTime() + oneWeekInMillis);
  }
  const consecutivesFound = await Promise.all(
    timeslotGroup.map((ts) => timeslotsAreConsecutive(ts)),
  );
  if (consecutivesFound.some((found) => found)) {
    throw new Error("Timeslot can't be consecutive with another");
  }
  const overlaps = await Promise.all(
    timeslotGroup.map((ts) => getInTimeRange(ts.start, ts.end)),
  );
  if (overlaps.some((foundSlots) => foundSlots.length > 0)) {
    throw new Error('Period already has a timeslot');
  }
  const firstTimeslot: Timeslot | null = await Timeslot.findByPk(id);
  if (firstTimeslot) {
    firstTimeslot.groupId = period.name;
    await firstTimeslot.save();
  }
  const addedTimeslot = await Timeslot
    .addGroupTimeslots(timeslotGroup.map((t) => ({ ...t, groupId: period.name })));
  return addedTimeslot;
};

const updateById = async (
  id: number,
  timeslot: { start: Date, end: Date, type: TimeslotType },
): Promise<void> => {
  if (await timeslotsAreConsecutive(timeslot, id)) {
    throw new Error('Timeslot can\'t be consecutive');
  }
  const oldTimeslot: Timeslot | null = await Timeslot.findByPk(id);
  if (oldTimeslot && isTimeInPast(oldTimeslot.start)) {
    throw new Error('Timeslot in past cannot be modified');
  }
  if (timeslot.type === 'available') {
    const oldReservations = await oldTimeslot?.getReservations();
    const newReservations = oldReservations?.filter(
      (reservation) => reservation.start >= timeslot.start && reservation.end <= timeslot.end,
    );
    if (oldReservations?.length !== newReservations?.length) {
      throw new Error('Timeslot has reservations');
    }
    await oldTimeslot?.removeReservations(oldReservations);
    await oldTimeslot?.addReservations(newReservations);
  }
  await Timeslot.upsert({ ...timeslot, id });
};

const createTimeslot = async (newTimeSlot: {
  start: Date;
  end: Date;
  type: TimeslotType;
}): Promise<TimeslotEntry> => {
  if (await timeslotsAreConsecutive(newTimeSlot)) {
    throw new Error('Timeslot can\'t be consecutive');
  }
  const timeslot: Timeslot = await Timeslot.create(newTimeSlot);
  if (newTimeSlot.type === 'available') {
    const reservations = await reservationService
      .getInTimeRange(newTimeSlot.start, newTimeSlot.end);
    await timeslot.addReservations(reservations);
  }
  return timeslot.dataValues;
};

export default {
  getInTimeRange,
  deleteById,
  updateById,
  createTimeslot,
  createPeriod,
};
