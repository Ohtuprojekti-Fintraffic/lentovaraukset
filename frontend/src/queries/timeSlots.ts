import { EventInput } from '@fullcalendar/core';

let placehoderTimeSlots: any[] = [];

const getTimeSlots = async (from: Date, until: Date): Promise<EventInput[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots?from=${from}&until=${until}`);
  return res.json();
};

const addTimeSlot = async (newTimeSlot: any): Promise<void> => {
  placehoderTimeSlots = placehoderTimeSlots.concat(
    { id: Date.now(), editable: true, ...newTimeSlot },
  );
};

const modifyTimeSlot = async (timeSlot: { id: string, startTime: Date, endTime: Date }): Promise<void> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots/${timeSlot.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      maxConcurrentFlights: 2 // Placeholder until functionality is adde for setting this in the frontend
    })
  });
  return res.json();
};

export { getTimeSlots, addTimeSlot, modifyTimeSlot };
