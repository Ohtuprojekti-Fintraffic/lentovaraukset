import axios from 'axios';

const getTimeslotQuery = async (startTime: Date, endTime: Date): Promise<string> => {
  const response = await axios.get(`/api/get/timeslot/${startTime.getTime()}/${endTime.getTime()}`);
  return response.data;
};

export default getTimeslotQuery;
