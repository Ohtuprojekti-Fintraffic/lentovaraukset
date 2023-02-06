let placehoderTimeSlots: any[] = [];

const getTimeSlots = async (): Promise<any[]> => (placehoderTimeSlots);

const addTimeSlot = async (newTimeSlot: any): Promise<void> => {
  placehoderTimeSlots = placehoderTimeSlots.concat(
    { id: Date.now(), editable: true, ...newTimeSlot },
  );
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

export { getTimeSlots, addTimeSlot, modifyTimeSlot };
