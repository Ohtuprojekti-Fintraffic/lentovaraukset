import { Op } from 'sequelize';
import {
  ServiceErrorCode, TimeslotEntry, WeekInDays,
} from '@lentovaraukset/shared/src/index';
import reservationService from '@lentovaraukset/backend/src/services/reservationService';
import { isTimeInPast } from '@lentovaraukset/shared/src/validation/validation';
import { Timeslot } from '../models';
import ServiceError from '../util/errors';

/**
 * Retrieves all timeslots for the specified airfield code that overlap with
 * the given time ranges within specified time ranges.
 *
 * Optionally, a timeslot ID can be excluded from the results, which can be
 * useful when updating a timeslot.
 *
 * @param airfieldCode - The airfield code.
 * @param ranges - An array of time ranges and optional timeslot IDs to exclude.
 * @returns An array of Timeslot objects.
 */
const getInTimeRanges = async (
  airfieldCode: string,
  ranges: {
    rangeStartTime: Date,
    rangeEndTime: Date,
    id: number | null,
  }[],
): Promise<Timeslot[]> => {
  const timeslots: Timeslot[] = await Timeslot.findAll({
    where: {
      airfieldCode,
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

/**
 * Retrieves all timeslots within a specified time range.
 * The result is an array of Timeslot objects that overlap with the given
 * time range.
 * @param airfieldCode - The airfield code.
 * @param rangeStartTime - The start time of the time range.
 * @param rangeEndTime - The end time of the time range.
 * @param id - An optional timeslot ID to exclude.
 * @returns An array of Timeslot objects.
 */
const getInTimeRange = async (
  airfieldCode: string,
  rangeStartTime: Date,
  rangeEndTime: Date,
  id: number | null = null,
): Promise<Timeslot[]> => {
  const timeslots: Timeslot[] = await getInTimeRanges(airfieldCode, [{
    rangeStartTime,
    rangeEndTime,
    id,
  }]);
  return timeslots;
};

/**
 * Throws an error if the provided timeslots lead to consecutive or overlapping timeslots.
 * @param airfieldCode - The airfield code.
 * @param timeslots - An array of timeslots.
 * @throws If the operation would result in consecutive or overlapping timeslots.
 */
type TimeslotEntryOptionalId = Partial<TimeslotEntry> & Omit<TimeslotEntry, 'id'>;
const errorIfLeadsToConsecutivesOrOverlaps = async (
  airfieldCode: string,
  timeslots: TimeslotEntryOptionalId[],
): Promise<void> => {
  const timeslotsInRanges = await getInTimeRanges(
    airfieldCode,
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

/**
 * Deletes a timeslot by its ID.
 * @param id - The timeslot ID.
 * @throws If timeslot does not exist, timeslot
 * is in the past, or timeslot has reservations.
 */
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

/**
 * Creates a series of periodic timeslots for a given airfield code.
 * Function calculates the day in milliseconds and iterates through the days of the period,
 * creating timeslots based on the input configurations.
 * It also checks for any consecutive or overlapping timeslots and saves the timeslot group.
 *
 * @param airfieldCode - The airfield code.
 * @param id - The ID of the first timeslot in the period.
 * @param period - The period configuration.
 * @param period.periodEnd - The end date of the period.
 * @param period.days - An object representing the active days of the week.
 * @param timeslot - Timeslot configuration without the ID.
 * @returns An array of created Timeslot objects.
 * @throws Throws error with code ServiceErrorCode.ConsecutiveTimeslotNotAllowed
 * if the created timeslots lead to consecutive timeslots.
 * @throws Throws error with code ServiceErrorCode.OverlappingTimeslotNotAllowed
 * if the created timeslots lead to overlapping timeslots.
 *
 */
const createPeriod = async (
  airfieldCode: string,
  id: number,
  period: {
    periodEnd: Date,
    days: WeekInDays,
  },
  timeslot: Omit<TimeslotEntry, 'id'>,
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

  const groupName = `group-${Date.now()}`;

  while (currentDate <= periodEnd) {
    const dayOfWeek = weekdays[currentDate.getDay()];
    if (days[dayOfWeek as keyof typeof days]) {
      const startTime = new Date(currentDate.getTime());
      const endTime = new Date(currentDate.getTime() + (end.getTime() - start.getTime()));
      timeslotGroup.push({
        airfieldCode,
        start: startTime,
        end: endTime,
        type,
        info,
        group: groupName,
      });
    }
    currentDate.setTime(currentDate.getTime() + dayInMillis);
  }

  await errorIfLeadsToConsecutivesOrOverlaps(timeslot.airfieldCode, timeslotGroup);

  const firstTimeslot: Timeslot | null = await Timeslot.findByPk(id);
  if (firstTimeslot) {
    firstTimeslot.group = groupName;
    await firstTimeslot.save();
  }
  const addedTimeslot = await Timeslot
    .addGroupTimeslots(timeslotGroup.map((t) => ({ ...t, group: groupName })));
  return addedTimeslot;
};

/**
 * Updates a timeslot by its ID.
 * @param id - The ID of the timeslot to update.
 * @param timeslot - Timeslot configuration without the ID.
 *
 * @throws Throws error with code ServiceErrorCode.TimeslotNotFound
 * if the timeslot with the specified ID is not found.
 * @throws Throws error if the timeslot is in the past and cannot be modified.
 * @throws Throws error with code ServiceErrorCode.TimeslotNotEditable
 * if the timeslot has reservations.

 */
const updateById = async (
  id: number,
  timeslot: Omit<TimeslotEntry, 'id'>,
): Promise<void> => {
  const oldTimeslot: Timeslot | null = await Timeslot.findByPk(id);
  await errorIfLeadsToConsecutivesOrOverlaps(timeslot.airfieldCode, [{ ...timeslot, id }]);

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
      .getInTimeRange(timeslot.start, timeslot.end, timeslot.airfieldCode);
    await Promise.all(reservations.map((r) => reservationService.deleteById(r.dataValues.id)));
  }

  await Timeslot.upsert({ ...timeslot, id });
};

/**
 * Creates a new timeslot.
 * @param newTimeSlot - Timeslot configuration without the ID.
 * @returns The created TimeslotEntry object.
 * @throws Throws error with code ServiceErrorCode.ConsecutiveTimeslotNotAllowed
 * if the created timeslot leads to consecutive timeslots.
 * @throws Throws error with code ServiceErrorCode.OverlappingTimeslotNotAllowed
 * if the created timeslot leads to overlapping timeslots.
 */
const createTimeslot = async (newTimeSlot: Omit<TimeslotEntry, 'id'>): Promise<TimeslotEntry> => {
  await errorIfLeadsToConsecutivesOrOverlaps(newTimeSlot.airfieldCode, [newTimeSlot]);

  const timeslot: Timeslot = await Timeslot.create(newTimeSlot);
  const reservations = await reservationService
    .getInTimeRange(newTimeSlot.start, newTimeSlot.end, timeslot.airfieldCode);
  if (newTimeSlot.type === 'available') {
    await timeslot.addReservations(reservations);
  } else {
    await Promise.all(reservations.map((r) => reservationService.deleteById(r.dataValues.id)));
  }
  return timeslot.dataValues;
};

/**
 * Updates timeslots of a given group for a specified airfield code.
 * The function fetches all timeslots of the group with a start time greater than
 * or equal to the starting date and updates their start
 * and end times according to the input configuration.
 * It also checks for any consecutive or overlapping timeslots before updating.
 *
 * @param airfieldCode - The airfield code.
 * @param group - The group name.
 * @param updates - The updates to apply to the timeslots.
 * @param updates.startingFrom - The starting date for the updates.
 * @param updates.startTimeOfDay - The new start time of the day.
 * @param updates.startTimeOfDay.hours - The new start hour.
 * @param updates.startTimeOfDay.minutes - The new start minute.
 * @param updates.endTimeOfDay - The new end time of the day.
 * @param updates.endTimeOfDay.hours - The new end hour.
 * @param updates.endTimeOfDay.minutes - The new end minute.
 * @returns An array of updated TimeslotEntry objects.
 * @throws If consecutive or overlapping timeslots are found.
 */
const updateByGroup = async (airfieldCode: string, group: string, updates: {
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

  await errorIfLeadsToConsecutivesOrOverlaps(airfieldCode, editedTimeslots);

  const updatedTimeslots = await Timeslot.bulkCreate(editedTimeslots, { updateOnDuplicate: ['start', 'end'] });
  return updatedTimeslots.map((ts) => ts.dataValues);
};

/**
 * This function deletes timeslots of a given group starting from a specified date.
 * It deletes all timeslots of the group with a start time greater than or
 * equal to the starting date and returns the number of deleted timeslots.
 *
 * @param group - The group name.
 * @param startingFrom - The starting date for the deletion.
 * @returns The number of deleted timeslots.
 */
const deleteByGroup = async (
  group: string,
  startingFrom: Date,
): Promise<Number> => {
  const deletedTimeslots = await Timeslot.destroy({
    where: { group, start: { [Op.gte]: startingFrom } },
  });

  return deletedTimeslots;
};

export default {
  getInTimeRange,
  deleteById,
  updateById,
  createTimeslot,
  createPeriod,
  updateByGroup,
  deleteByGroup,
};
