import { Op } from 'sequelize';
import type { TimeslotEntry, TimeslotType, WeekInDays } from '@lentovaraukset/shared/src/index';
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
  period: {
    periodEnd: Date,
    name: string,
    days: WeekInDays,
  },
  timeslot: { start: Date, end: Date, type: TimeslotType, info: string | null },
): Promise<Timeslot[]> => {
  const { periodEnd, days } = period;
  const dayInMillis = 24 * 60 * 60 * 1000;
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const timeslotGroup: { start: Date, end: Date, type: TimeslotType, info: string | null }[] = [];
  const {
    start,
    end,
    type,
    info,
  } = timeslot;
  const currentDate = new Date(start.getTime() + dayInMillis);

  while (currentDate <= periodEnd) {
    const dayOfWeek = weekdays[currentDate.getDay()];
    if (days[dayOfWeek as keyof typeof days]) {
      const startTime = new Date(currentDate.getTime());
      const endTime = new Date(currentDate.getTime() + (end.getTime() - start.getTime()));
      timeslotGroup.push({
        start: startTime,
        end: endTime,
        type,
        info,
      });
    }
    currentDate.setTime(currentDate.getTime() + dayInMillis);
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
    firstTimeslot.group = period.name;
    await firstTimeslot.save();
  }
  const addedTimeslot = await Timeslot
    .addGroupTimeslots(timeslotGroup.map((t) => ({ ...t, group: period.name })));
  return addedTimeslot;
};

const updateById = async (
  id: number,
  timeslot: { start: Date, end: Date, type: TimeslotType, info: string | null },
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
  } else {
    const reservations = await reservationService
      .getInTimeRange(timeslot.start, timeslot.end);
    reservations.forEach(async (r) => {
      await reservationService.deleteById(r.id);
    });
  }
  await Timeslot.upsert({ ...timeslot, id });
};

const createTimeslot = async (newTimeSlot: {
  start: Date;
  end: Date;
  type: TimeslotType;
  info: string | null;
}): Promise<TimeslotEntry> => {
  if (await timeslotsAreConsecutive(newTimeSlot)) {
    throw new Error('Timeslot can\'t be consecutive');
  }
  const timeslot: Timeslot = await Timeslot.create(newTimeSlot);
  const reservations = await reservationService
    .getInTimeRange(newTimeSlot.start, newTimeSlot.end);
  if (newTimeSlot.type === 'available') {
    await timeslot.addReservations(reservations);
  } else {
    reservations.forEach(async (r) => {
      await reservationService.deleteById(r.id);
    });
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
