import { TimeslotEntry } from '@lentovaraukset/shared/src';
import { errorIfNotOk } from './util';

const getTimeSlots = async (from: Date, until: Date): Promise<TimeslotEntry[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots?from=${from.toISOString()}&until=${until.toISOString()}`);
  errorIfNotOk(res);
  return res.json();
};

const addTimeSlot = async (newTimeSlot: { start: Date, end: Date, type: 'available' | 'blocked' }): Promise<void> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTimeSlot),
  });
  errorIfNotOk(res);
};

const modifyTimeSlot = async (
  timeSlot: TimeslotEntry,
  period?: {
    end: Date,
    name: string,
    days: {
      monday: boolean,
      tuesday: boolean,
      wednesday: boolean,
      thursday: boolean,
      friday: boolean,
      saturday: boolean,
      sunday: boolean,
    }
  },
): Promise<void> => {
  const modifiedTimeSlot = {
    ...timeSlot,
    periodEnd: period?.end,
    name: period?.name,
    days: {
      monday: period?.days.monday,
      tuesday: period?.days.thursday,
      wednesday: period?.days.wednesday,
      thursday: period?.days.thursday,
      friday: period?.days.friday,
      saturday: period?.days.saturday,
      sunday: period?.days.sunday,
    },
  };

  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots/${timeSlot.id}`, {
    method: 'PUT',
    body: JSON.stringify(modifiedTimeSlot),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
};

const deleteTimeslot = async (id: Number): Promise<string> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
  return res.text();
};

export {
  getTimeSlots, addTimeSlot, modifyTimeSlot, deleteTimeslot,
};
