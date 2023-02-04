let placehoderTimeSlots = [
  {
    id: '1',
    start: '2023-01-31T10:00:00',
    end: '2023-01-31T16:00:00',
    editable: true,
  },
  {
    id: '2',
    start: '2023-02-01T10:00:00',
    end: '2023-02-01T16:00:00',
    editable: true,
  },
  {
    id: '3',
    start: '2023-02-02T10:00:00',
    end: '2023-02-02T14:00:00',
    editable: true,
  },
];
const getTimeSlots = async (): Promise<any[]> => (placehoderTimeSlots);

const addTimeSlot = async (newTimeSlot: any): Promise<void> => {
  placehoderTimeSlots = placehoderTimeSlots.concat(
    { id: Date.now(), editable: true, ...newTimeSlot },
  );
};

const modifyTimeSlot = async (timeSlot: any): Promise<void> => {
  placehoderTimeSlots[
    placehoderTimeSlots.findIndex(((element) => element.id === timeSlot.id))
  ] = {
    id: timeSlot.id,
    start: timeSlot.start,
    end: timeSlot.end,
    editable: true,
  };
};

export { getTimeSlots, addTimeSlot, modifyTimeSlot };
