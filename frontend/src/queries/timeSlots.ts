import { TimeslotEntry } from '@lentovaraukset/shared/src';
import { TimeslotCalendarEvent } from '../types';

const getTimeSlots = async (from: Date, until: Date): Promise<TimeslotEntry[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots?from=${from.toISOString()}&until=${until.toISOString()}`);
  return res.json();
};

const addTimeSlot = async (timeslot: Pick<TimeslotEntry, 'start' | 'end'>): Promise<void> => {
  await fetch(`${process.env.BASE_PATH}/api/timeslots/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(timeslot),
  });
};

const modifyTimeSlot = async ({ start, end, id }: Pick<TimeslotCalendarEvent, 'start' | 'end' | 'id'>): Promise<void> => {
  const modifiedTimeSlot = {
    start, end,
  };
  await fetch(`${process.env.BASE_PATH}/api/timeslots/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(modifiedTimeSlot),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const deleteTimeslot = async (id: Number): Promise<string> => {
  const response = await fetch(`${process.env.BASE_PATH}/api/timeslots/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.text();
};

export {
  getTimeSlots, addTimeSlot, modifyTimeSlot, deleteTimeslot,
};
