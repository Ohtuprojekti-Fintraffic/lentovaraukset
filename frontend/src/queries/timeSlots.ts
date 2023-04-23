import { TimeslotEntry, WeekInDays } from '@lentovaraukset/shared/src';
import { errorIfNotOk } from './util';

// TODO: ICAO code should be passed on from the context in the calling component
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
  timeSlot: Omit<TimeslotEntry, 'airfieldCode'>,
  period?: {
    end: Date,
    days: WeekInDays
  },
): Promise<void> => {
  const modifiedTimeSlot = {
    ...timeSlot,
    periodEnd: period?.end,
    days: period?.days,
  };

  const res = await fetch(`${process.env.BASE_PATH}/api/${airfieldCode}/timeslots/${timeSlot.id}`, {
    method: 'PUT',
    body: JSON.stringify(modifiedTimeSlot),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
};

const deleteTimeslot = async (id: Number): Promise<string> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/${airfieldCode}/timeslots/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
  return res.text();
};

const modifyGroup = async (group: string, updates: {
  startingFrom: Date,
  startTimeOfDay: { hours: number, minutes: number },
  endTimeOfDay: { hours: number, minutes: number }
}): Promise<void> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/${airfieldCode}/timeslots/group/${group}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
};

const deleteGroup = async (group: string, updates: {
  startingFrom: Date,
}): Promise<void> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/${airfieldCode}/timeslots/group/${group}`, {
    method: 'DELETE',
    body: JSON.stringify(updates),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
};

export {
  getTimeSlots, addTimeSlot, modifyTimeSlot, deleteTimeslot, modifyGroup, deleteGroup,
};
