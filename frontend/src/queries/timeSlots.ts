import { EventInput } from '@fullcalendar/core';

const placehoderTimeSlots: any[] = [];

const getTimeSlots = async (from: Date, until: Date): Promise<EventInput[]> => {
  const res = await fetch(`${process.env.BASE_PATH}/api/timeslots?from=${from}&until=${until}`);
  return res.json();
};
const modifyTimeSlot = async (timeSlot: any): Promise<void> => {
  placehoderTimeSlots[
    placehoderTimeSlots.findIndex(
      (element) => parseInt(element.id, 10) === parseInt(timeSlot.id, 10),
    )
  ] = {
    id: timeSlot.id,
    start: timeSlot.start,
    end: timeSlot.end,
    editable: true,
  };
};

export {
  getTimeSlots, modifyTimeSlot,
};
