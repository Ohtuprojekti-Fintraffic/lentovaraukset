const getTimeslotQuery = async (startTime: Date, endTime: Date): Promise<string> => {
  const response = await fetch(`/api/get/timeslot/${startTime.getTime()}/${endTime.getTime()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.text();
};

export default getTimeslotQuery;
