import { TimeslotEntry } from '@lentovaraukset/shared/src';
import { errorIfNotOk } from './util';

const getTimeSlots = async (from: Date, until: Date): Promise<TimeslotEntry[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots?from=${from.toISOString()}&until=${until.toISOString()}`);
  errorIfNotOk(res);
  return res.json();
};

const addTimeSlot = async (newTimeSlot: { start: Date, end: Date }): Promise<void> => {
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
  timeSlot: { id: string, start: Date, end: Date },
  period?: { end: Date, name: string },
): Promise<void> => {
  const modifiedTimeSlot = {
    start: timeSlot.start,
    end: timeSlot.end,
    periodEnd: period?.end,
    name: period?.name,
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
