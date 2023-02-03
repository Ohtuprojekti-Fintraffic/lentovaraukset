import axios from 'axios';

const getTimeslotQuery = async (startTime: Date, endTime: Date): Promise<string> => {
  console.log(`${startTime.getTime()}/${endTime.getTime()}`);
  // console.log(process);
  const response = await axios.get(`/api/timeslots/${startTime.getTime()}/${endTime.getTime()}`);
  return response.data;
};

export default getTimeslotQuery;
