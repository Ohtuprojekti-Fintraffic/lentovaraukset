import { TimeslotEntry } from '@lentovaraukset/shared/src';

const getTimeSlots = async (from: Date, until: Date): Promise<TimeslotEntry[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots?from=${from.toISOString()}&until=${until.toISOString()}`);
  return res.json();
};

const addTimeSlot = async (newTimeSlot: { start: Date, end: Date, type: 'available' | 'blocked' }): Promise<void> => {
  await fetch(`${process.env.BASE_PATH}/api/timeslots/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTimeSlot),
  });
};

const modifyTimeSlot = async (
  timeSlot: TimeslotEntry,
): Promise<void> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots/${String(timeSlot.id)}`, {
    method: 'PUT',
    body: JSON.stringify(timeSlot),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.json();
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
