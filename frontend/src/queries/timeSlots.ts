import { TimeslotEntry, WeekInDays } from '@lentovaraukset/shared/src';
import { errorIfNotOk } from './util';

const airfieldCode = 'EFHK';

const getTimeSlots = async (from: Date, until: Date): Promise<TimeslotEntry[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/${airfieldCode}/timeslots?from=${from.toISOString()}&until=${until.toISOString()}`);
  errorIfNotOk(res);
  return res.json();
};

const addTimeSlot = async (newTimeSlot: { start: Date, end: Date, type: 'available' | 'blocked', info: string | null }): Promise<void> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/${airfieldCode}/timeslots/`, {
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
    days: WeekInDays
  },
): Promise<void> => {
  const modifiedTimeSlot = {
    ...timeSlot,
    periodEnd: period?.end,
    name: period?.name,
    days: period?.days,
  };

  const res = await fetch(`${process.env.BASE_PATH}/${airfieldCode}/api/timeslots/${timeSlot.id}`, {
    method: 'PUT',
    body: JSON.stringify(modifiedTimeSlot),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
};

const deleteTimeslot = async (id: Number): Promise<string> => {
  const res = await fetch(`${process.env.BASE_PATH}/${airfieldCode}/api/timeslots/${id}`, {
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
