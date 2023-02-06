const postTimeslot = async (startTime: Date): Promise<string> => {
  const body = JSON.stringify({ startTime: startTime.getTime() });
  const response = await fetch('api/timeslots/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });
  return response.text();
};

export default postTimeslot;
