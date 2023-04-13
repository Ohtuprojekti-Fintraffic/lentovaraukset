import { Op } from 'sequelize';
import { ServiceErrorCode, TimeslotEntry, TimeslotType, WeekInDays } from '@lentovaraukset/shared/src/index';
import reservationService from '@lentovaraukset/backend/src/services/reservationService';
import { isTimeInPast } from '@lentovaraukset/shared/src/validation/validation';
import { Timeslot } from '../models';
import ServiceError from '../util/errors';

const getInTimeRanges = async (
  ranges: {
    rangeStartTime: Date,
    rangeEndTime: Date,
    id: number | null,
  }[],
): Promise<Timeslot[]> => {
  const timeslots: Timeslot[] = await Timeslot.findAll({
    where: {
      [Op.or]: ranges.map((range) => ({
        [Op.and]: [
          {
            start: {
              [Op.lt]: range.rangeEndTime,
            },
            end: {
              [Op.gt]: range.rangeStartTime,
            },
          },
          range.id
            ? {
              id: {
                [Op.ne]: range.id,
              },
            }
            : {},
        ],
      })),
    },
  });
  return timeslots;
};

const getInTimeRange = async (
  rangeStartTime: Date,
  rangeEndTime: Date,
  id: number | null = null,
): Promise<Timeslot[]> => {
  const timeslots: Timeslot[] = await getInTimeRanges([{
    rangeStartTime,
    rangeEndTime,
    id,
  }]);
  return timeslots;
};

type TimeslotEntryOptionalId = Partial<TimeslotEntry> & Omit<TimeslotEntry, 'id'>;
const errorIfLeadsToConsecutivesOrOverlaps = async (
  timeslots: TimeslotEntryOptionalId[],
): Promise<void> => {
  const timeslotsInRanges = await getInTimeRanges(
    timeslots.map((t) => {
      const newStart = new Date(t.start);
      const newEnd = new Date(t.end);
      newStart.setMinutes(newStart.getMinutes() - 1);
      newEnd.setMinutes(newEnd.getMinutes() + 1);
      return {
        rangeStartTime: newStart,
        rangeEndTime: newEnd,
        id: t.id ?? null,
      };
    }),
  );

  timeslots.forEach((timeslot) => {
    timeslotsInRanges.forEach((otherTimeslot) => {
      if (
        timeslot.type === otherTimeslot.type
        && (timeslot.start.getTime() === otherTimeslot.end.getTime()
        || timeslot.end.getTime() === otherTimeslot.start.getTime())
      ) {
        throw new ServiceError(ServiceErrorCode.ConsecutiveTimeslots, 'Operation would result in consecutive timeslots');
      }
    });
  });

  if (timeslotsInRanges.filter((ts) => ts.type === timeslots[0].type).length > 0) {
    throw new ServiceError(ServiceErrorCode.OverlappingTimeslots, 'Operation would result in overlapping timeslots');
  }
};

const deleteById = async (id: number) => {
  const timeslot = await Timeslot.findByPk(id);
  if (!timeslot) throw new Error('Timeslot does not exist');
  if (isTimeInPast(timeslot.start)) throw new Error('Timeslot in past cannot be deleted');
  const reservations = await timeslot?.getReservations();
  if (reservations?.length !== 0) {
    throw new ServiceError(ServiceErrorCode.TimeslotNotEditable, 'Timeslot has reservations');
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

  const timeslotGroup: Omit<TimeslotEntry, 'id'>[] = [];
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
        group: period.name,
      });
    }
    currentDate.setTime(currentDate.getTime() + dayInMillis);
  }

  await errorIfLeadsToConsecutivesOrOverlaps(timeslotGroup);

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
  const oldTimeslot: Timeslot | null = await Timeslot.findByPk(id);
  await errorIfLeadsToConsecutivesOrOverlaps([{ ...timeslot, id }]);

  if (oldTimeslot === null) {
    throw new ServiceError(ServiceErrorCode.TimeslotNotFound, 'No timeslot with id exists');
  }

  const slotHasMoved = oldTimeslot.start.getTime() !== timeslot.start.getTime();
  // if the timeslot has started, its start time can't be edited
  // and if timeslot has ended it's no longer editable at all
  if (
    (slotHasMoved
      && isTimeInPast(oldTimeslot.start))
    || isTimeInPast(oldTimeslot.end)) {
    throw new Error('Timeslot in past cannot be modified');
  }

  if (timeslot.type === 'available') {
    const oldReservations = await oldTimeslot.getReservations();
    const newReservations = oldReservations.filter(
      (reservation) => reservation.start >= timeslot.start && reservation.end <= timeslot.end,
    );
    if (oldReservations.length !== newReservations.length) {
      throw new ServiceError(ServiceErrorCode.TimeslotNotEditable, 'Timeslot has reservations');
    }
    await oldTimeslot.removeReservations(oldReservations);
    await oldTimeslot.addReservations(newReservations);
  } else {
    const reservations = await reservationService
      .getInTimeRange(timeslot.start, timeslot.end);
    await Promise.all(reservations.map((r) => reservationService.deleteById(r.dataValues.id)));
  }

  await Timeslot.upsert({ ...timeslot, id });
};

const createTimeslot = async (newTimeSlot: {
  start: Date;
  end: Date;
  type: TimeslotType;
  info: string | null;
}): Promise<TimeslotEntry> => {
  await errorIfLeadsToConsecutivesOrOverlaps([newTimeSlot]);

  const timeslot: Timeslot = await Timeslot.create(newTimeSlot);
  const reservations = await reservationService
    .getInTimeRange(newTimeSlot.start, newTimeSlot.end);
  if (newTimeSlot.type === 'available') {
    await timeslot.addReservations(reservations);
  } else {
    await Promise.all(reservations.map((r) => reservationService.deleteById(r.dataValues.id)));
  }
  return timeslot.dataValues;
};

const updateByGroup = async (group: string, updates: {
  startingFrom: Date;
  startTimeOfDay: { hours: number, minutes: number };
  endTimeOfDay: { hours: number, minutes: number };
}): Promise<TimeslotEntry[]> => {
  const timeslots = await Timeslot.findAll({
    where: { group, start: { [Op.gte]: updates.startingFrom } },
  });

  const editedTimeslots = timeslots.map(({ dataValues: timeslot }) => {
    timeslot.start.setHours(updates.startTimeOfDay.hours, updates.startTimeOfDay.minutes);
    timeslot.end.setHours(updates.endTimeOfDay.hours, updates.endTimeOfDay.minutes);
    return timeslot;
  });

  await errorIfLeadsToConsecutivesOrOverlaps(editedTimeslots);

  const updatedTimeslots = await Timeslot.bulkCreate(editedTimeslots, { updateOnDuplicate: ['start', 'end'] });
  return updatedTimeslots.map((ts) => ts.dataValues);
};

export default {
  getInTimeRange,
  deleteById,
  updateById,
  createTimeslot,
  createPeriod,
  updateByGroup,
};
