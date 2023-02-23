import { TimeSlotsCalendarEvent } from '../types';

const getTimeSlots = async (from: Date, until: Date): Promise<TimeSlotsCalendarEvent[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots?from=${from.toISOString()}&until=${until.toISOString()}`);
  return res.json();
};

const addTimeSlot = async (newTimeSlot: Partial<TimeSlotsCalendarEvent>): Promise<void> => {
  await fetch(`${process.env.BASE_PATH}/api/timeslots/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTimeSlot),
  });
};

const modifyTimeSlot = async (
  timeSlot: TimeSlotsCalendarEvent,
): Promise<void> => {
  const modifiedTimeSlot = {
    start: timeSlot.start,
    end: timeSlot.end,
  };

  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots/${timeSlot.id}`, {
    method: 'PATCH',
    body: JSON.stringify(modifiedTimeSlot),
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
