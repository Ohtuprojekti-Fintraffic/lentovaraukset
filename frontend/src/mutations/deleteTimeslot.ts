const deleteTimeslot = async (startTime: Date): Promise<string> => {
  const response = await fetch(`/api/timeslots/${startTime.toISOString()}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.text();
};

export default deleteTimeslot;
