import { EventInput } from '@fullcalendar/core';

const getTimeSlots = async (from: Date, until: Date): Promise<EventInput[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots?from=${from}&until=${until}`);
  return res.json();
};

const addTimeSlot = async (newTimeSlot: { startTime: Date, endTime: Date }): Promise<void> => {
  await fetch(`${process.env.BASE_PATH}/api/timeslots/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTimeSlot),
  });
};

const modifyTimeSlot = async (
  timeSlot: { id: string, startTime: Date, endTime: Date },
): Promise<void> => {
  const modifiedTimeSlot = {
    startTime: timeSlot.startTime,
    endTime: timeSlot.endTime,
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
