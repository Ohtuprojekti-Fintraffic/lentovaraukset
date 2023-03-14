import { EventInput } from '@fullcalendar/core';

const getTimeSlots = async (from: Date, until: Date): Promise<EventInput[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots?from=${from.toISOString()}&until=${until.toISOString()}`);
  return res.json();
};

const addTimeSlot = async (newTimeSlot: { start: Date, end: Date }): Promise<void> => {
  await fetch(`${process.env.BASE_PATH}/api/timeslots/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTimeSlot),
  });
};

const modifyTimeSlot = async (
  timeSlot: { id: string, start: Date, end: Date },
  period?: { start: Date, end: Date, name: string },
): Promise<void> => {
  const modifiedTimeSlot = {
    start: timeSlot.start,
    end: timeSlot.end,
    periodStart: period?.start,
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
