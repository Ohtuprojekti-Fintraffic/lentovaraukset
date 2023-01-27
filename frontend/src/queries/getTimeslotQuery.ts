const getTimeslotQuery = async (startTime: Date, endTime: Date): Promise<string> => {
  console.log(startTime, endTime);
  const response = await fetch('/api/get/timeslot', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startTime,
    }),
  });
  return response.text();
};

export default getTimeslotQuery;
