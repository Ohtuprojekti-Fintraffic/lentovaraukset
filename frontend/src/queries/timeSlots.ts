import { TimeslotEntry, WeekInDays } from '@lentovaraukset/shared/src';
import { errorIfNotOk } from './util';

const getTimeSlots = async (from: Date, until: Date, airportCode: string)
: Promise<TimeslotEntry[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/${airportCode}/timeslots?from=${from.toISOString()}&until=${until.toISOString()}`);
  errorIfNotOk(res);
  return res.json();
};

const addTimeSlot = async (newTimeSlot: { start: Date, end: Date, type: 'available' | 'blocked', info: string | null }, airportCode?: string): Promise<void> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/${airportCode}/timeslots/`, {
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
  airportCode: string,
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

  const res = await fetch(`${process.env.BASE_PATH}/api/${airportCode}/timeslots/${timeSlot.id}`, {
    method: 'PUT',
    body: JSON.stringify(modifiedTimeSlot),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
};

const deleteTimeslot = async (id: Number, airportCode: string): Promise<string> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/${airportCode}/timeslots/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  errorIfNotOk(res);
  return res.text();
};

const modifyGroup = async (
  group: string,
  updates: {
    startingFrom: Date,
    startTimeOfDay: { hours: number, minutes: number },
    endTimeOfDay: { hours: number, minutes: number }
  },
  airportCode?: string,
): Promise<void> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/${airportCode}/timeslots/group/${group}`, {
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
