const addTimeSlot = async (newTimeSlot: any): Promise<void> => {
  await fetch('api/timeslots/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTimeSlot),
  });
};

export default addTimeSlot;
